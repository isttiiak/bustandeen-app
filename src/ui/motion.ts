import { Easing, FadeIn, FadeInDown, useReducedMotion } from 'react-native-reanimated';

// Motion rules (docs/06-UI-DESIGN.md sections 0 and 7): quiet, 150-250 ms, ease-out, used to explain
// a change. With "reduce motion" on (the system setting; the web pref `bustandeen_reduce_motion`
// joins it once preferences are stored, P2-07/P2-14), movement is replaced by short fades.

export const duration = { fast: 150, base: 220, slow: 320 } as const;
export const easeOut = Easing.out(Easing.cubic);
export const springSoft = { damping: 20, stiffness: 220, mass: 0.9 } as const;

/** True when movement and scaling should be replaced by fades or nothing. */
export function useReduceMotion(): boolean {
  return useReducedMotion();
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
