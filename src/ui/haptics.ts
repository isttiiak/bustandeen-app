import * as Haptics from 'expo-haptics';

import { uiPrefs } from '@/lib/uiPrefs';

// Haptic vocabulary (docs/06-UI-DESIGN.md section 7). One place, so the vibration preference can
// switch every call off: the web pref `bustandeen_vibration` (`'0'` = off), changed in Settings and
// applied at once (src/lib/uiPrefs.ts). Failures are swallowed: a missing motor must never break a tap.

export type HapticKind =
  /** A light tick: a zikr count, a button press. */
  | 'tick'
  /** A selection changed: option, segment, toggle. */
  | 'select'
  /** A target was reached. */
  | 'medium'
  /** A whole set was completed, e.g. all five prayers. */
  | 'success'
  | 'warning';

/** Tests and Settings: turns every haptic on or off (saved under the web key). */
export function setHapticsEnabled(value: boolean): void {
  uiPrefs.setVibration(value);
}
export function hapticsEnabled(): boolean {
  return uiPrefs.get().vibration;
}

export function haptic(kind: HapticKind): void {
  if (!hapticsEnabled()) return;
  const run = (): Promise<void> => {
    switch (kind) {
      case 'tick':
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      case 'select':
        return Haptics.selectionAsync();
      case 'medium':
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      case 'success':
        return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      case 'warning':
        return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };
  run().catch(() => undefined);
}
