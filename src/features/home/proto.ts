import { useSyncExternalStore } from 'react';

// Prototype-only switches (task P2-05 redo) so the owner can review every state on a phone: layout
// A or B, a pretend time of day, fasting on or off, and active or empty progress. In memory, never
// saved or synced. Deleted when the design is approved and real data lands (P3).
export type HomeLayout = 'a' | 'b';
export interface Proto {
  layout: HomeLayout;
  /** Minutes after midnight to pretend it is, or null for the real clock. */
  simMinutes: number | null;
  fasting: boolean;
  /** `true`: sample counts and streaks exist. `false`: a first-run, empty account. */
  active: boolean;
  /** Real time (ms) when `simMinutes` was chosen, so the pretend clock keeps ticking from there. */
  simAt: number;
}

let state: Proto = {
  layout: 'a',
  simMinutes: 13 * 60,
  fasting: true,
  active: true,
  simAt: Date.now(),
};
const listeners = new Set<() => void>();

export function setProto(patch: Partial<Proto>): void {
  state = {
    ...state,
    ...patch,
    ...(patch.simMinutes !== undefined ? { simAt: Date.now() } : null),
  };
  listeners.forEach((l) => l());
}

export function useProto(): Proto {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state
  );
}

/** The real clock, or the pretend time (ticking on from when it was chosen). */
export function applySim(real: Date, sim: number | null, simAt: number): Date {
  if (sim == null) return real;
  const midnight = new Date(real.getFullYear(), real.getMonth(), real.getDate()).getTime();
  return new Date(midnight + sim * 60000 + (real.getTime() - simAt));
}
