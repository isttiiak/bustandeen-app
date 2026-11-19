import * as Haptics from 'expo-haptics';

// Haptic vocabulary (docs/06-UI-DESIGN.md section 7). One place, so the vibration preference can
// switch every call off. The web pref `bustandeen_vibration` is wired in P2-07/P2-14; until then it
// is on. Failures are swallowed: a missing motor must never break a tap.

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

let enabled = true;

export function setHapticsEnabled(value: boolean): void {
  enabled = value;
}
export function hapticsEnabled(): boolean {
  return enabled;
}

export function haptic(kind: HapticKind): void {
  if (!enabled) return;
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
