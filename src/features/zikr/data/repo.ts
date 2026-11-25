// Local zikr storage: tables `zikr_day` and `zikr_unsent` (src/db/schema.ts, migration 0001_zikr).
// Plain parameterised SQL over a tiny runner, so the same code runs on the encrypted expo-sqlite
// database on the phone and on Node's in-memory SQLite in tests. Every change is one transaction and
// is written before the tap returns, so an app kill right after a tap loses nothing.

/** The part of a synchronous SQLite connection this file needs. */
export interface SqlRunner {
  run: (sql: string, params?: readonly (string | number | null)[]) => void;
  all: <T>(sql: string, params?: readonly (string | number | null)[]) => T[];
  transaction: (fn: () => void) => void;
}

/** Owner of local rows until sign-in exists (doc 04 section 4: every row is tagged with an owner). */
export const LOCAL_OWNER = 'guest';

export interface DayRow {
  zikrType: string;
  count: number;
  shown: number;
}

export interface UnsentRow {
  day: string;
  zikrType: string;
  amount: number;
  untimedAmount: number;
  firstTs: number | null;
  lastTs: number | null;
}

export function createZikrRepo(db: SqlRunner, owner: string = LOCAL_OWNER) {
  const addUnsent = (day: string, type: string, delta: number, now: number, tap: boolean) => {
    db.run(
      `INSERT INTO zikr_unsent (owner_uid, day, zikr_type, amount, untimed_amount, first_ts, last_ts)
       VALUES (?, ?, ?, ?, 0, ?, ?)
       ON CONFLICT (owner_uid, day, zikr_type) DO UPDATE SET
         amount = amount + excluded.amount,
         first_ts = COALESCE(first_ts, excluded.first_ts),
         last_ts = COALESCE(excluded.last_ts, last_ts)`,
      [owner, day, type, delta, tap ? now : null, tap ? now : null]
    );
  };

  return {
    /** Today's rows (one per zikr that has any). */
    day(day: string): DayRow[] {
      return db.all<DayRow>(
        `SELECT zikr_type AS zikrType, count, shown FROM zikr_day WHERE owner_uid = ? AND day = ?`,
        [owner, day]
      );
    },

    /** Total of all zikr per day, from `since` (inclusive), for the streak. */
    totals(since: string): Map<string, number> {
      const rows = db.all<{ day: string; total: number }>(
        `SELECT day, SUM(count) AS total FROM zikr_day WHERE owner_uid = ? AND day >= ? GROUP BY day`,
        [owner, since]
      );
      return new Map(rows.map((r) => [r.day, r.total]));
    },

    /** One tap: today's count and the counter both go up by one; the unsent amount too. */
    increment(day: string, type: string, now: number): void {
      db.transaction(() => {
        db.run(
          `INSERT INTO zikr_day (owner_uid, day, zikr_type, count, shown, updated_at)
           VALUES (?, ?, ?, 1, 1, ?)
           ON CONFLICT (owner_uid, day, zikr_type) DO UPDATE SET
             count = count + 1, shown = shown + 1, updated_at = excluded.updated_at`,
          [owner, day, type, now]
        );
        addUnsent(day, type, 1, now, true);
      });
    },

    /** Undo one: only while the counter on screen is above 0 (the web checks the same). */
    undo(day: string, type: string, now: number): boolean {
      let changed = false;
      db.transaction(() => {
        const [row] = db.all<{ count: number; shown: number }>(
          `SELECT count, shown FROM zikr_day WHERE owner_uid = ? AND day = ? AND zikr_type = ?`,
          [owner, day, type]
        );
        if (!row || row.shown <= 0) return;
        db.run(
          `UPDATE zikr_day SET shown = shown - 1, count = MAX(0, count - 1), updated_at = ?
           WHERE owner_uid = ? AND day = ? AND zikr_type = ?`,
          [now, owner, day, type]
        );
        if (row.count > 0) addUnsent(day, type, -1, now, false);
        changed = true;
      });
      return changed;
    },

    /** Reset (owner, Q2): the counter on screen goes to 0; today's recorded count keeps the taps. */
    reset(day: string, type: string, now: number): void {
      db.run(
        `UPDATE zikr_day SET shown = 0, updated_at = ? WHERE owner_uid = ? AND day = ? AND zikr_type = ?`,
        [now, owner, day, type]
      );
    },

    /** Everything not sent yet, oldest day first (for the later outbox; nothing reads it today). */
    unsent(): UnsentRow[] {
      return db.all<UnsentRow>(
        `SELECT day, zikr_type AS zikrType, amount, untimed_amount AS untimedAmount,
                first_ts AS firstTs, last_ts AS lastTs
         FROM zikr_unsent WHERE owner_uid = ? AND amount != 0 ORDER BY day, zikr_type`,
        [owner]
      );
    },
  };
}

export type ZikrRepo = ReturnType<typeof createZikrRepo>;
