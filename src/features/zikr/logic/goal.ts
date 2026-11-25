import { DEFAULT_DAILY_GOAL, DEFAULT_GRACE_DAYS } from './streak';

// The daily zikr goal and its grace days. On the web this is server data (`ZikrGoal`, set on the Zikr
// analytics page; limits from web `backend/src/validation/analytics.schemas.ts`: target 1 to 100000,
// grace 0 to 3). Here it lives on the phone until zikr sync exists, when the server's goal replaces it
// (D18, D19).

export const GOAL_MIN = 1;
export const GOAL_MAX = 100000;
export const GRACE_OPTIONS = [0, 1, 2, 3] as const;
/** Quick choices in the goal sheet: the web's onboarding choices (33, 100, 300) and 1000. */
export const GOAL_PRESETS = [33, 100, 300, 1000] as const;

export interface ZikrGoal {
  dailyTarget: number;
  graceDays: number;
}

export const DEFAULT_GOAL: ZikrGoal = {
  dailyTarget: DEFAULT_DAILY_GOAL,
  graceDays: DEFAULT_GRACE_DAYS,
};

export const isValidTarget = (n: number) => Number.isInteger(n) && n >= GOAL_MIN && n <= GOAL_MAX;
const isValidGrace = (n: number) => (GRACE_OPTIONS as readonly number[]).includes(n);

/** Reads the stored goal; anything missing or out of range falls back to the server's defaults. */
export function parseGoal(raw: string | undefined): ZikrGoal {
  try {
    const v = JSON.parse(raw ?? '') as Partial<ZikrGoal>;
    return {
      dailyTarget:
        typeof v.dailyTarget === 'number' && isValidTarget(v.dailyTarget)
          ? v.dailyTarget
          : DEFAULT_GOAL.dailyTarget,
      graceDays:
        typeof v.graceDays === 'number' && isValidGrace(v.graceDays)
          ? v.graceDays
          : DEFAULT_GOAL.graceDays,
    };
  } catch {
    return DEFAULT_GOAL;
  }
}

/** True when the tap that moved today's total from `before` to `after` reached the goal. */
export function reachesGoal(before: number, after: number, target: number): boolean {
  return before < target && after >= target;
}
