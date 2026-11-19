import type { ReactNode } from 'react';
import { Pressable, type AccessibilityRole, type AccessibilityState } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { haptic, type HapticKind } from './haptics';
import { duration, springSoft, useReduceMotion } from './motion';

export interface PressableScaleProps {
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  /** Haptic on press; `false` for none. Default is a light tick. */
  haptic?: HapticKind | false;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
  testID?: string;
  /** Classes for the visible surface (the part that scales). */
  className?: string;
  /** Classes for the outer hit area, e.g. `flex-1` for a child of a row. */
  containerClassName?: string;
  children?: ReactNode;
  hitSlop?: number;
}

/**
 * The press feedback every tappable surface shares: a quick scale-down with a soft return, a haptic
 * on press, and a fade instead of scaling when reduce motion is on (docs/06 sections 0 and 7).
 * Visuals live on the inner view so the whole surface scales; the outer Pressable is the hit area.
 */
export function PressableScale({
  onPress,
  onLongPress,
  disabled,
  haptic: kind = 'tick',
  accessibilityState,
  className,
  containerClassName,
  children,
  hitSlop,
  ...a11y
}: PressableScaleProps) {
  const pressed = useSharedValue(0);
  const reduce = useReduceMotion();

  const style = useAnimatedStyle(() => ({
    transform: reduce ? [] : [{ scale: 1 - 0.03 * pressed.get() }],
    opacity: reduce ? 1 - 0.25 * pressed.get() : 1,
  }));

  return (
    <Pressable
      className={containerClassName}
      accessible
      disabled={disabled}
      hitSlop={hitSlop}
      accessibilityState={{ disabled: !!disabled, ...accessibilityState }}
      onPressIn={() => {
        pressed.set(withTiming(1, { duration: duration.fast / 2 }));
      }}
      onPressOut={() => {
        pressed.set(
          reduce ? withTiming(0, { duration: duration.fast }) : withSpring(0, springSoft)
        );
      }}
      onPress={() => {
        if (kind) haptic(kind);
        onPress?.();
      }}
      onLongPress={onLongPress}
      {...a11y}
    >
      <Animated.View className={className} style={style}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
