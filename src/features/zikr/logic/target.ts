// The counter's target (the web's "tasbih mode": `useUiStore.ts`, `ZikrSettings.tsx`, `ZikrCounter.tsx`).
// Off by default. With a target the big number counts down from it; reaching it completes a set and
// the next tap starts a new one.

export const TARGET_PRESETS = [33, 34, 99, 100] as const;
export const TARGET_MIN = 1;
export const TARGET_MAX = 1000;
export const DEFAULT_TARGET = 33;

/** The web's clamp: whole number from 1 to 1000; anything unreadable is 33. */
export function clampTarget(value: number): number {
  const n = Math.round(value);
  if (!Number.isFinite(n) || n === 0) return DEFAULT_TARGET;
  return Math.max(TARGET_MIN, Math.min(TARGET_MAX, n));
}

/** Reads the stored `bustandeen_tasbih_target` string the way the web does (default 33). */
export function parseStoredTarget(raw: string | undefined): number {
  const n = parseInt(raw ?? '', 10);
  return Number.isFinite(n) && n > 0 ? clampTarget(n) : DEFAULT_TARGET;
}

export interface SetProgress {
  /** Counts done in the current set. */
  done: number;
  /** Counts left (the big number). */
  remaining: number;
  /** 0 to 1, for the ring. */
  progress: number;
}

/** Progress of the set that began when the counter showed `start`. */
export function setProgress(shown: number, start: number, target: number): SetProgress {
  const done = Math.max(0, shown - start);
  const remaining = Math.max(0, target - done);
  return { done, remaining, progress: Math.min(1, done / target) };
}

/** True when the tap that brought the counter to `shown` completes the set. */
export function completesSet(shown: number, start: number, target: number): boolean {
  return shown - start >= target;
}

/** Without a target, a stronger haptic marks every 33 (the web marks 33, 66 and 99). */
export function isMilestone(shown: number): boolean {
  return shown > 0 && shown % 33 === 0;
}
