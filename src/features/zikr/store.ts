import { useEffect, useSyncExternalStore } from 'react';
import { AppState } from 'react-native';

import { PREF_KEYS, prefStore, type PrefStore } from '@/lib/prefs';

import { DEFAULT_ZIKR } from './content';
import { createZikrRepo, type SqlRunner, type ZikrRepo } from './data/repo';
import { addDays, zikrToday } from './logic/day';
import { parseGoal, type ZikrGoal } from './logic/goal';
import { addZikr, inList, myList, parseNames, removeZikr, type ListState } from './logic/list';
import { zikrStreak } from './logic/streak';
import { clampTarget, parseStoredTarget } from './logic/target';

// Zikr state for the counter screen and the Home card. The encrypted database is the source of truth;
// this keeps today's rows in memory so a tap never waits on a read. Small external store (no new
// dependency): `useSyncExternalStore`, like the language store.

export interface ZikrCounts {
  /** Recorded today (Home card, streak). */
  count: number;
  /** The counter on screen (Reset sets it to 0). */
  shown: number;
}

export interface ZikrSnapshot {
  status: 'idle' | 'loading' | 'ready' | 'error';
  /** The day the rows belong to (see logic/day.ts). */
  day: string;
  rows: Readonly<Record<string, ZikrCounts>>;
  /** Today's total of all zikr. */
  todayTotal: number;
  streak: number;
  selected: string;
  /** The web's "tasbih mode". */
  targetOn: boolean;
  target: number;
  /** Daily goal and grace days for the streak and the goal moment (on the phone until sync). */
  goal: ZikrGoal;
  /** The user's zikr list, in order (built-in, then added from the library). */
  list: readonly string[];
}

export interface ZikrStoreDeps {
  open: () => Promise<SqlRunner>;
  now: () => number;
  prefs: PrefStore;
}

const EMPTY: ZikrCounts = { count: 0, shown: 0 };

export function createZikrStore(deps: ZikrStoreDeps) {
  const listeners = new Set<() => void>();
  let repo: ZikrRepo | null = null;
  let opening: Promise<void> | null = null;
  let totals = new Map<string, number>();

  let listState: ListState = {
    hidden: parseNames(deps.prefs.getString(PREF_KEYS.zikrHidden)),
    added: parseNames(deps.prefs.getString(PREF_KEYS.zikrAdded)),
  };
  const storedSelected = deps.prefs.getString(PREF_KEYS.zikrSelected);
  const initialList = myList(listState);
  let snap: ZikrSnapshot = {
    status: 'idle',
    day: zikrToday(new Date(deps.now())),
    rows: {},
    todayTotal: 0,
    streak: 0,
    selected:
      storedSelected && inList(listState, storedSelected)
        ? storedSelected
        : (initialList[0] ?? DEFAULT_ZIKR),
    targetOn: deps.prefs.getString(PREF_KEYS.tasbihMode) === '1',
    target: parseStoredTarget(deps.prefs.getString(PREF_KEYS.tasbihTarget)),
    goal: parseGoal(deps.prefs.getString(PREF_KEYS.zikrGoal)),
    list: initialList,
  };

  const emit = (next: Partial<ZikrSnapshot>) => {
    snap = { ...snap, ...next };
    listeners.forEach((l) => l());
  };

  const streakNow = (day: string, goal: ZikrGoal = snap.goal) =>
    zikrStreak(totals, day, goal.dailyTarget, goal.graceDays);

  const derive = (day: string, rows: Record<string, ZikrCounts>) => {
    const todayTotal = Object.values(rows).reduce((sum, r) => sum + r.count, 0);
    totals.set(day, todayTotal);
    return { todayTotal, streak: streakNow(day) };
  };

  /** Re-reads today (and the history the streak needs) from the database. */
  const load = () => {
    if (!repo) return;
    const day = zikrToday(new Date(deps.now()));
    const rows: Record<string, ZikrCounts> = {};
    for (const r of repo.day(day)) rows[r.zikrType] = { count: r.count, shown: r.shown };
    totals = repo.totals(addDays(day, -366));
    emit({ status: 'ready', day, rows, ...derive(day, rows) });
  };

  /** A new day began since the last read: switch to it. True when it did. */
  const rollOver = (): boolean => {
    if (!repo || zikrToday(new Date(deps.now())) === snap.day) return false;
    load();
    return true;
  };

  const saveList = (next: ListState) => {
    listState = next;
    deps.prefs.setString(PREF_KEYS.zikrHidden, JSON.stringify(next.hidden));
    deps.prefs.setString(PREF_KEYS.zikrAdded, JSON.stringify(next.added));
    emit({ list: myList(next) });
  };

  const write = (type: string, counts: ZikrCounts) => {
    const rows = { ...snap.rows, [type]: counts };
    emit({ rows, ...derive(snap.day, rows) });
  };

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    get: () => snap,

    /** Opens the database once. Safe to call from every screen that shows zikr. */
    start(): Promise<void> {
      opening ??= (async () => {
        emit({ status: 'loading' });
        try {
          repo = createZikrRepo(await deps.open());
          load();
        } catch (e) {
          console.error('Zikr storage could not be opened', e);
          emit({ status: 'error' });
        }
      })();
      return opening;
    },

    /** Checks for a new day (screen focus, app back in front). */
    refreshDay(): boolean {
      return rollOver();
    },

    /** One tap. Returns the counter on screen after it, or null when nothing could be saved. */
    increment(): number | null {
      if (!repo) return null;
      rollOver();
      const type = snap.selected;
      repo.increment(snap.day, type, deps.now());
      const cur = snap.rows[type] ?? EMPTY;
      const next = { count: cur.count + 1, shown: cur.shown + 1 };
      write(type, next);
      return next.shown;
    },

    /** One less on the counter on screen (never below 0). True when something changed. */
    undo(): boolean {
      if (!repo) return false;
      rollOver();
      const type = snap.selected;
      if (!repo.undo(snap.day, type, deps.now())) return false;
      const cur = snap.rows[type] ?? EMPTY;
      write(type, { count: Math.max(0, cur.count - 1), shown: Math.max(0, cur.shown - 1) });
      return true;
    },

    /** The counter on screen back to 0; today's count stays (owner, Q2). */
    reset(): void {
      if (!repo) return;
      rollOver();
      const type = snap.selected;
      repo.reset(snap.day, type, deps.now());
      write(type, { ...(snap.rows[type] ?? EMPTY), shown: 0 });
    },

    select(type: string): void {
      if (!inList(listState, type) || type === snap.selected) return;
      deps.prefs.setString(PREF_KEYS.zikrSelected, type);
      emit({ selected: type });
    },

    /** Adds a zikr from the library (or brings back a removed built-in). True when the list changed. */
    addToList(name: string): boolean {
      const next = addZikr(listState, name);
      if (next === listState) return false;
      saveList(next);
      return true;
    },

    /** Removes a zikr from the list (its counts stay). Core zikr cannot be removed. */
    removeFromList(name: string): boolean {
      const next = removeZikr(listState, name);
      if (next === listState) return false;
      saveList(next);
      if (!inList(next, snap.selected)) {
        const first = snap.list[0] ?? DEFAULT_ZIKR;
        deps.prefs.setString(PREF_KEYS.zikrSelected, first);
        emit({ selected: first });
      }
      return true;
    },

    /** Saves the daily goal and grace days; the streak follows at once. */
    setGoal(goal: ZikrGoal): void {
      const next = parseGoal(JSON.stringify(goal));
      deps.prefs.setString(PREF_KEYS.zikrGoal, JSON.stringify(next));
      emit({ goal: next, streak: streakNow(snap.day, next) });
    },

    /** `null` turns the target off; a number turns it on (clamped to 1..1000 like the web). */
    setTarget(target: number | null): void {
      if (target === null) {
        deps.prefs.setString(PREF_KEYS.tasbihMode, '0');
        emit({ targetOn: false });
        return;
      }
      const t = clampTarget(target);
      deps.prefs.setString(PREF_KEYS.tasbihMode, '1');
      deps.prefs.setString(PREF_KEYS.tasbihTarget, String(t));
      emit({ targetOn: true, target: t });
    },
  };
}

export type ZikrStore = ReturnType<typeof createZikrStore>;

let shared: ZikrStore | null = null;

/** The app's zikr store. The database adapter loads on first use, so tests that never call this
 *  do not need the native SQLite module. */
export function zikrStore(): ZikrStore {
  shared ??= createZikrStore({
    open: () => {
      // Loaded on first use so unit tests of the store never load the native SQLite module.
      // eslint-disable-next-line @typescript-eslint/no-require-imports -- lazy native module, see above
      const { openZikrDatabase } = require('./data/sqlite') as typeof import('./data/sqlite');
      return openZikrDatabase();
    },
    now: () => Date.now(),
    prefs: prefStore,
  });
  return shared;
}

/** Today's zikr state; opens the database on first use and follows a new day when the app returns. */
export function useZikr(store: ZikrStore = zikrStore()): ZikrSnapshot {
  useEffect(() => {
    void store.start();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') store.refreshDay();
    });
    return () => sub.remove();
  }, [store]);
  return useSyncExternalStore(store.subscribe, store.get);
}

/** The counts of one zikr today. */
export function countsOf(snap: ZikrSnapshot, type: string): ZikrCounts {
  return snap.rows[type] ?? EMPTY;
}
