import { addDays } from './day';

// The zikr streak, ported from the server's rule (web `backend/src/services/streak.service.ts`,
// `getStreakStatus`, read at web main 5b55a3a5 on 2026-11-25). TEMPORARY (owner, 2026-11-25, Q1): the
// server is the judge of streaks (CLAUDE.md, doc 04). This runs only because the app has no server
// connection yet; when zikr sync lands, the server's `currentStreak` replaces it.
//
// The rule: a day counts when the total of all zikr that day reaches the daily goal (server default
// 100). Up to `graceDays` missed days in a row are forgiven (server default 1). Today is never a miss
// while it is in progress. The walk looks back at most 365 days. Not ported, because nothing local has
// them: pause, the credit anchor and the fresh-start floor.

export const DEFAULT_DAILY_GOAL = 100;
export const DEFAULT_GRACE_DAYS = 1;
const LOOKBACK_DAYS = 365;

/** `totals`: zikr total per day (YYYY-MM-DD). */
export function zikrStreak(
  totals: ReadonlyMap<string, number>,
  today: string,
  goal: number = DEFAULT_DAILY_GOAL,
  graceDays: number = DEFAULT_GRACE_DAYS
): number {
  const met = (day: string) => (totals.get(day) ?? 0) >= goal;
  const floor = addDays(today, -LOOKBACK_DAYS);
  let streak = met(today) ? 1 : 0;
  let misses = 0;
  let cursor = addDays(today, -1);
  for (let i = 0; i < LOOKBACK_DAYS + 1; i++) {
    if (cursor < floor) break;
    if (met(cursor)) {
      streak++;
      misses = 0;
    } else {
      misses++;
      if (misses > graceDays) break;
    }
    cursor = addDays(cursor, -1);
  }
  return streak;
}
