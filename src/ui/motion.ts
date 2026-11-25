import { createElement } from 'react';
import {
  Easing,
  FadeIn,
  FadeInDown,
  ReduceMotion,
  ReducedMotionConfig,
  useReducedMotion,
} from 'react-native-reanimated';

import { effectiveReduceMotion, useUiPrefs } from '@/lib/uiPrefs';

// Motion rules (docs/06-UI-DESIGN.md sections 0 and 7): quiet, 150-250 ms, ease-out, used to explain
// a change. "Reduce animations" in Settings (web pref `bustandeen_reduce_motion`: Auto follows the
// phone, On always, Off never) replaces movement with short fades.

export const duration = { fast: 150, base: 220, slow: 320 } as const;
export const easeOut = Easing.out(Easing.cubic);
export const springSoft = { damping: 20, stiffness: 220, mass: 0.9 } as const;

/** True when movement and scaling should be replaced by fades or nothing. */
export function useReduceMotion(): boolean {
  const phone = useReducedMotion();
  return effectiveReduceMotion(useUiPrefs().reduceMotion, phone);
}

/**
 * Mount once at the root. Reanimated also checks the phone setting inside each animation; this makes
 * every animation follow the app's choice instead (On: none, Off: all, Auto: the phone).
 */
export function MotionPreference() {
  const mode = useUiPrefs().reduceMotion;
  return createElement(ReducedMotionConfig, {
    mode:
      mode === 'on'
        ? ReduceMotion.Always
        : mode === 'off'
          ? ReduceMotion.Never
          : ReduceMotion.System,
  });
}

/**
 * Entering animation for the n-th block of a screen: a short staggered rise and fade (a fade alone
 * with reduce motion). Pass it to an Animated view's `entering` prop.
 */
export function useEntering(index: number) {
  const reduce = useReduceMotion();
  return reduce
    ? FadeIn.delay(index * 40).duration(duration.fast)
    : FadeInDown.delay(index * 70).duration(duration.slow);
}
