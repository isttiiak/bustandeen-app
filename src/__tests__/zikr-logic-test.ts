import { counterCardValue } from '@/features/home/cardValue';
import { BUILT_IN_ZIKR, zikrName } from '@/features/zikr/content';
import { addDays, zikrToday } from '@/features/zikr/logic/day';
import { zikrStreak } from '@/features/zikr/logic/streak';
import {
  clampTarget,
  completesSet,
  isMilestone,
  parseStoredTarget,
  setProgress,
} from '@/features/zikr/logic/target';

describe('zikr day (placeholder until core: phone calendar date)', () => {
  it('names the local calendar day, changing at midnight', () => {
    expect(zikrToday(new Date(2026, 10, 25, 23, 59, 59))).toBe('2026-11-25');
    expect(zikrToday(new Date(2026, 10, 26, 0, 0, 0))).toBe('2026-11-26');
    expect(zikrToday(new Date(2026, 0, 5, 12))).toBe('2026-01-05');
  });

  it('adds days across months, years and a leap day', () => {
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01');
    expect(addDays('2027-01-01', -1)).toBe('2026-12-31');
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
    expect(addDays('2026-11-25', -366)).toBe('2025-11-24');
  });
});

describe('zikr streak (server rule: goal 100 over all zikr, 1 missed day forgiven)', () => {
  const today = '2026-11-25';
  const days = (entries: [number, number][]) =>
    new Map(entries.map(([ago, total]) => [addDays(today, -ago), total]));

  it('is 0 with no history', () => {
    expect(zikrStreak(new Map(), today)).toBe(0);
  });

  it('does not count today as a miss while it is in progress', () => {
    expect(
      zikrStreak(
        days([
          [1, 100],
          [2, 150],
        ]),
        today
      )
    ).toBe(2);
  });

  it('counts today once the goal is reached', () => {
    expect(
      zikrStreak(
        days([
          [0, 100],
          [1, 100],
        ]),
        today
      )
    ).toBe(2);
    expect(
      zikrStreak(
        days([
          [0, 99],
          [1, 100],
        ]),
        today
      )
    ).toBe(1);
  });

  it('forgives one missed day in a row', () => {
    expect(
      zikrStreak(
        days([
          [1, 100],
          [3, 100],
          [4, 100],
        ]),
        today
      )
    ).toBe(3);
    // Yesterday missed, today not yet reached: the chain is still alive (the server's "grace" state).
    expect(
      zikrStreak(
        days([
          [2, 100],
          [3, 100],
        ]),
        today
      )
    ).toBe(2);
  });

  it('breaks after two missed days in a row', () => {
    expect(
      zikrStreak(
        days([
          [1, 100],
          [4, 100],
          [5, 100],
        ]),
        today
      )
    ).toBe(1);
    expect(zikrStreak(days([[3, 100]]), today)).toBe(0);
  });

  it('honours a different goal and grace like the server parameters', () => {
    expect(zikrStreak(days([[1, 40]]), today, 33)).toBe(1);
    expect(
      zikrStreak(
        days([
          [1, 100],
          [4, 100],
        ]),
        today,
        100,
        2
      )
    ).toBe(2);
    expect(
      zikrStreak(
        days([
          [1, 100],
          [3, 100],
        ]),
        today,
        100,
        0
      )
    ).toBe(1);
  });

  it('stops at 365 days back', () => {
    const all = new Map<string, number>();
    for (let i = 0; i < 500; i++) all.set(addDays(today, -i), 100);
    expect(zikrStreak(all, today)).toBe(366);
  });
});

describe('zikr target (web tasbih mode)', () => {
  it('clamps and reads the stored target like the web', () => {
    expect(clampTarget(0)).toBe(33);
    expect(clampTarget(5000)).toBe(1000);
    expect(clampTarget(-4)).toBe(1);
    expect(clampTarget(99.6)).toBe(100);
    expect(parseStoredTarget(undefined)).toBe(33);
    expect(parseStoredTarget('abc')).toBe(33);
    expect(parseStoredTarget('100')).toBe(100);
    expect(parseStoredTarget('4000')).toBe(1000);
  });

  it('counts down and completes on the target tap', () => {
    expect(setProgress(10, 0, 33)).toEqual({ done: 10, remaining: 23, progress: 10 / 33 });
    expect(setProgress(5, 7, 33)).toEqual({ done: 0, remaining: 33, progress: 0 });
    expect(completesSet(32, 0, 33)).toBe(false);
    expect(completesSet(33, 0, 33)).toBe(true);
    expect(completesSet(66, 33, 33)).toBe(true);
  });

  it('marks every 33 without a target', () => {
    expect([0, 1, 33, 34, 66, 99].map(isMilestone)).toEqual([
      false,
      false,
      true,
      false,
      true,
      true,
    ]);
  });
});

describe('Home counter card rule', () => {
  it('shows today, else the streak, else the word', () => {
    expect(counterCardValue(54, 9)).toEqual({ kind: 'count', value: 54 });
    expect(counterCardValue(0, 9)).toEqual({ kind: 'streak', value: 9 });
    expect(counterCardValue(0, 0)).toEqual({ kind: 'word' });
  });
});

describe('built-in zikr content', () => {
  it('is the web default list, with Bangla names in Bangla script', () => {
    expect(BUILT_IN_ZIKR.map((z) => z.type)).toEqual([
      'SubhanAllah',
      'Alhamdulillah',
      'Allahu Akbar',
      'La ilaha illallah',
    ]);
    for (const z of BUILT_IN_ZIKR) {
      expect(z.arabic).toMatch(/^[؀-ۿ\s]+$/);
      expect(z.nameBn).toMatch(/[ঀ-৿]/);
    }
    expect(zikrName('Allahu Akbar', 'en')).toBe('Allahu Akbar');
    expect(zikrName('Allahu Akbar', 'bn')).toBe('আল্লাহু আকবার');
  });
});
