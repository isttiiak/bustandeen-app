import { useEffect } from 'react';
import { View, type DimensionValue } from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { useTheme } from '@/theme/ThemeProvider';
import type { ColorName } from '@/theme/tokens';

import { haptic } from './haptics';
import { duration, easeOut, springSoft, useReduceMotion } from './motion';

/** A placeholder block while content loads. Pulses softly; static with reduce motion. */
export function Skeleton({
  width = '100%',
  height = 16,
  radius = 8,
}: {
  width?: DimensionValue;
  height?: number;
  radius?: number;
}) {
  const reduce = useReduceMotion();
  const opacity = useSharedValue(0.5);
  useEffect(() => {
    if (reduce) {
      opacity.set(0.6);
      return;
    }
    opacity.set(
      withRepeat(
        withSequence(withTiming(0.9, { duration: 800 }), withTiming(0.45, { duration: 800 })),
        -1
      )
    );
  }, [reduce, opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.get() }));
  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="bg-surface"
      style={[{ width, height, borderRadius: radius }, style]}
    />
  );
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

export interface ProgressRingProps {
  /** 0 to 1. */
  progress: number;
  size?: number;
  stroke?: number;
  color?: ColorName;
  /** Spoken value, e.g. "3 of 5 prayers". */
  label: string;
  children?: React.ReactNode;
}

/** A ring that fills to `progress` (animated; instant with reduce motion). */
export function ProgressRing({
  progress,
  size = 96,
  stroke = 8,
  color = 'emerald',
  label,
  children,
}: ProgressRingProps) {
  const theme = useTheme();
  const reduce = useReduceMotion();
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.min(1, Math.max(0, progress));
  const filled = useSharedValue(clamped);

  useEffect(() => {
    filled.set(
      reduce ? clamped : withTiming(clamped, { duration: duration.slow * 2, easing: easeOut })
    );
  }, [clamped, reduce, filled]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - filled.get()),
  }));

  return (
    <View
      style={{ width: size, height: size }}
      className="items-center justify-center"
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
    >
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={theme.color('ink')}
          strokeOpacity={0.1}
          strokeWidth={stroke}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={theme.color(color)}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
}

/**
 * A completion moment: a disc pops in and a check draws itself, with a success haptic. Quiet and
 * short (docs/06 section 0); with reduce motion it just appears. Plays when `play` turns true.
 */
export function CompletionCheck({
  play,
  size = 72,
  label,
}: {
  play: boolean;
  size?: number;
  label: string;
}) {
  const theme = useTheme();
  const reduce = useReduceMotion();
  const scale = useSharedValue(reduce ? 1 : 0);
  const draw = useSharedValue(reduce ? 1 : 0);
  const LENGTH = 40;

  useEffect(() => {
    if (!play) {
      scale.set(reduce ? 1 : 0);
      draw.set(reduce ? 1 : 0);
      return;
    }
    haptic('success');
    if (reduce) {
      scale.set(1);
      draw.set(1);
      return;
    }
    scale.set(withSpring(1, springSoft));
    draw.set(withDelay(120, withTiming(1, { duration: duration.slow, easing: easeOut })));
  }, [play, reduce, scale, draw]);

  const disc = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
    opacity: play ? 1 : 0.0,
  }));
  const pathProps = useAnimatedProps(() => ({ strokeDashoffset: LENGTH * (1 - draw.get()) }));

  return (
    <Animated.View
      accessible
      accessibilityRole="image"
      accessibilityLabel={label}
      style={[{ width: size, height: size }, disc]}
      className="items-center justify-center rounded-full bg-emerald-dim"
    >
      <Svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
        <AnimatedPath
          d="M5 13l4 4L19 7"
          stroke={theme.color('on-color')}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={LENGTH}
          animatedProps={pathProps}
        />
      </Svg>
    </Animated.View>
  );
}
