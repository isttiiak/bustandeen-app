import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createZikrRepo } from '@/features/zikr/data/repo';
import { createZikrStore } from '@/features/zikr/store';
import { PREF_KEYS, type PrefStore } from '@/lib/prefs';

import { openMigrated, runner } from '../../jest/sqlite';

function memoryPrefs(
  initial: Record<string, string> = {}
): PrefStore & { data: Map<string, string> } {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getString: (k) => data.get(k),
    setString: (k, v) => void data.set(k, v),
    remove: (k) => void data.delete(k),
  };
}

const at = (y: number, mo: number, d: number, h = 12, mi = 0) =>
  new Date(y, mo - 1, d, h, mi).getTime();

async function setup(path = ':memory:', prefs = memoryPrefs()) {
  const sqlite = await openMigrated(path);
  let now = at(2026, 11, 25);
  const store = createZikrStore({
    open: async () => runner(sqlite),
    now: () => now,
    prefs,
  });
  await store.start();
  return {
    sqlite,
    store,
    prefs,
    setNow: (t: number) => {
      now = t;
    },
  };
}

describe('zikr store: counting', () => {
  it('counts, undoes and resets the counter on screen', async () => {
    const { store } = await setup();
    expect(store.get().status).toBe('ready');
    for (let i = 0; i < 5; i++) store.increment();
    expect(store.get().rows.SubhanAllah).toEqual({ count: 5, shown: 5 });

    expect(store.undo()).toBe(true);
    expect(store.get().rows.SubhanAllah).toEqual({ count: 4, shown: 4 });

    // Reset (owner, Q2): the counter goes to 0, today's count keeps the taps.
    store.reset();
    expect(store.get().rows.SubhanAllah).toEqual({ count: 4, shown: 0 });
    expect(store.get().todayTotal).toBe(4);

    // Undo stops at 0 on screen.
    expect(store.undo()).toBe(false);
    expect(store.get().rows.SubhanAllah).toEqual({ count: 4, shown: 0 });
  });

  it('keeps each zikr apart and totals them for the day', async () => {
    const { store } = await setup();
    store.increment();
    store.select('Alhamdulillah');
    store.increment();
    store.increment();
    expect(store.get().rows).toEqual({
      SubhanAllah: { count: 1, shown: 1 },
      Alhamdulillah: { count: 2, shown: 2 },
    });
    expect(store.get().todayTotal).toBe(3);
  });

  it('ignores an unknown zikr and saves the choice and the target under the web keys', async () => {
    const { store, prefs } = await setup();
    store.select('Not a zikr');
    expect(store.get().selected).toBe('SubhanAllah');
    store.select('Allahu Akbar');
    store.setTarget(100);
    expect(prefs.data.get(PREF_KEYS.zikrSelected)).toBe('Allahu Akbar');
    expect(prefs.data.get(PREF_KEYS.tasbihMode)).toBe('1');
    expect(prefs.data.get(PREF_KEYS.tasbihTarget)).toBe('100');
    store.setTarget(5000);
    expect(store.get().target).toBe(1000);
    store.setTarget(null);
    expect(prefs.data.get(PREF_KEYS.tasbihMode)).toBe('0');
    expect(store.get().targetOn).toBe(false);
  });

  it('keeps unsent amounts in the shape of a web batch entry', async () => {
    const { store, sqlite } = await setup();
    store.increment();
    store.increment();
    store.increment();
    store.undo();
    const rows = createZikrRepo(runner(sqlite)).unsent();
    expect(rows).toEqual([
      {
        day: '2026-11-25',
        zikrType: 'SubhanAllah',
        amount: 2,
        untimedAmount: 0,
        firstTs: at(2026, 11, 25),
        lastTs: at(2026, 11, 25),
      },
    ]);
  });
});

describe('zikr store: day rollover', () => {
  it('starts a fresh day at midnight and keeps yesterday with yesterday', async () => {
    const { store, sqlite, setNow } = await setup();
    setNow(at(2026, 11, 25, 23, 59));
    store.increment();
    store.increment();
    expect(store.get().day).toBe('2026-11-25');

    setNow(at(2026, 11, 26, 0, 0));
    store.increment();
    expect(store.get().day).toBe('2026-11-26');
    expect(store.get().rows.SubhanAllah).toEqual({ count: 1, shown: 1 });
    expect(store.get().todayTotal).toBe(1);

    const repo = createZikrRepo(runner(sqlite));
    expect(repo.day('2026-11-25')).toEqual([{ zikrType: 'SubhanAllah', count: 2, shown: 2 }]);
    expect(repo.unsent().map((r) => [r.day, r.amount])).toEqual([
      ['2026-11-25', 2],
      ['2026-11-26', 1],
    ]);
  });

  it('notices a new day on focus without a tap', async () => {
    const { store, setNow } = await setup();
    store.increment();
    expect(store.refreshDay()).toBe(false);
    setNow(at(2026, 11, 26, 6));
    expect(store.refreshDay()).toBe(true);
    expect(store.get().rows).toEqual({});
  });

  it('undo after midnight does not reach back into yesterday', async () => {
    const { store, setNow } = await setup();
    store.increment();
    setNow(at(2026, 11, 26, 0, 1));
    expect(store.undo()).toBe(false);
    expect(store.get().todayTotal).toBe(0);
  });

  it('builds the streak from the days in the database', async () => {
    const { store, setNow } = await setup();
    const tap = (n: number) => {
      for (let i = 0; i < n; i++) store.increment();
    };
    setNow(at(2026, 11, 22));
    tap(100);
    setNow(at(2026, 11, 23));
    tap(100);
    // 2026-11-24 missed: forgiven (one day).
    setNow(at(2026, 11, 25));
    store.refreshDay();
    expect(store.get().streak).toBe(2);
    tap(100);
    expect(store.get().streak).toBe(3);
  });
});

describe('zikr store: persistence', () => {
  it('survives a restart (a new store over the same database file)', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'zikr-'));
    const file = join(dir, 'test.db');
    try {
      const prefs = memoryPrefs();
      const first = await setup(file, prefs);
      first.store.select('Alhamdulillah');
      first.store.setTarget(33);
      for (let i = 0; i < 7; i++) first.store.increment();
      first.store.reset();
      first.store.increment();
      first.sqlite.close();

      const second = await setup(file, prefs);
      const s = second.store.get();
      expect(s.selected).toBe('Alhamdulillah');
      expect(s.targetOn).toBe(true);
      expect(s.target).toBe(33);
      expect(s.rows.Alhamdulillah).toEqual({ count: 8, shown: 1 });
      expect(s.todayTotal).toBe(8);
      second.sqlite.close();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('reports an error instead of crashing when storage cannot open', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const store = createZikrStore({
      open: async () => {
        throw new Error('no SQLCipher');
      },
      now: () => at(2026, 11, 25),
      prefs: memoryPrefs(),
    });
    await store.start();
    expect(store.get().status).toBe('error');
    expect(store.increment()).toBeNull();
    spy.mockRestore();
  });

  it('starts with the web defaults when nothing is stored', async () => {
    const { store } = await setup(':memory:', memoryPrefs({ [PREF_KEYS.tasbihTarget]: 'x' }));
    expect(store.get()).toEqual(
      expect.objectContaining({ selected: 'SubhanAllah', targetOn: false, target: 33 })
    );
  });
});

describe('zikr store: daily goal', () => {
  it('uses the saved goal and grace days for the streak, and saves them', async () => {
    const { store, setNow, prefs } = await setup();
    const tap = (n: number) => {
      for (let i = 0; i < n; i++) store.increment();
    };
    setNow(at(2026, 11, 22));
    tap(40);
    setNow(at(2026, 11, 23));
    tap(40);
    setNow(at(2026, 11, 25));
    store.refreshDay();
    expect(store.get().streak).toBe(0); // 40 a day is under the default 100

    store.setGoal({ dailyTarget: 33, graceDays: 1 });
    expect(store.get().streak).toBe(2);
    expect(prefs.data.get(PREF_KEYS.zikrGoal)).toBe('{"dailyTarget":33,"graceDays":1}');

    store.setGoal({ dailyTarget: 33, graceDays: 0 });
    expect(store.get().streak).toBe(0); // 2026-11-24 missed, nothing forgiven

    store.setGoal({ dailyTarget: 0, graceDays: 9 });
    expect(store.get().goal).toEqual({ dailyTarget: 100, graceDays: 1 });
  });
});
