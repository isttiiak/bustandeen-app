import { useSyncExternalStore } from 'react';

import { PREF_KEYS, prefStore, type PrefStore } from './prefs';

// Accessibility preferences that change how the whole app feels: reduce motion and vibration. Web keys
// and web values (web `frontend/src/store/useUiStore.ts`, read at main 59c0af68), so preference sync
// (P2-14) can carry them unchanged. Read synchronously at start; saved on every change.

export type ReduceMotionMode = 'auto' | 'on' | 'off';
export const REDUCE_MOTION_MODES: readonly ReduceMotionMode[] = ['auto', 'on', 'off'];

/** The web's rule: 'on' / 'off' / 'auto'. An old saved '1' means on; anything else is auto. */
export function parseReduceMotionMode(raw: string | undefined | null): ReduceMotionMode {
  if (raw === 'on' || raw === '1') return 'on';
  if (raw === 'off') return 'off';
  return 'auto';
}

/** In force now: 'on', or 'auto' while the phone asks for reduced motion. */
export function effectiveReduceMotion(mode: ReduceMotionMode, phoneReduces: boolean): boolean {
  return mode === 'on' || (mode === 'auto' && phoneReduces);
}

/** The web's rule: vibration is on unless '0' was saved. */
export function parseVibration(raw: string | undefined | null): boolean {
  return raw !== '0';
}

export function createUiPrefs(store: PrefStore) {
  const listeners = new Set<() => void>();
  let state = {
    reduceMotion: parseReduceMotionMode(store.getString(PREF_KEYS.reduceMotion)),
    vibration: parseVibration(store.getString(PREF_KEYS.vibration)),
  };
  const emit = (next: Partial<typeof state>) => {
    state = { ...state, ...next };
    listeners.forEach((l) => l());
  };
  return {
    get: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    setReduceMotion(mode: ReduceMotionMode) {
      store.setString(PREF_KEYS.reduceMotion, mode);
      emit({ reduceMotion: mode });
    },
    setVibration(on: boolean) {
      store.setString(PREF_KEYS.vibration, on ? '1' : '0');
      emit({ vibration: on });
    },
  };
}

export const uiPrefs = createUiPrefs(prefStore);

export function useUiPrefs() {
  return useSyncExternalStore(uiPrefs.subscribe, uiPrefs.get);
}
