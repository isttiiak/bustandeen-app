import { useEffect, useState } from 'react';
import { AccessibilityInfo, PixelRatio, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { CompletionCheck, ProgressRing } from '@/ui/Feedback';
import { duration, easeOut, springSoft, useReduceMotion } from '@/ui/motion';
import { Text } from '@/ui/Text';

/**
 * What just happened, so the dial can answer it with motion. `key` changes on every beat.
 * - tap: the number lifts and a soft ripple leaves the ring, like a bead sliding on.
 * - milestone: every 33 without a target; a fuller lift and a wider ripple.
 * - undo: the number dips back. reset: it settles in from smaller.
 * - switch: another zikr was chosen; the number fades in. blocked: nothing to undo; a small side nudge
 *   (no haptic for this, doc 06 section 7).
 */
export type DialBeat = {
  key: number;
  kind: 'tap' | 'milestone' | 'undo' | 'reset' | 'switch' | 'blocked';
};

/**
 * The counting surface: the whole lower part of the screen is one big tap target (doc 06 section 6,
 * one-hand use), with the ring and the number in its middle. The ring size follows the space it gets,
 * so it fits a 360 dp phone at font scale 1.3 and a tall phone alike.
 */
export function CounterDial({
  value,
  progress,
  unit,
  caption,
  label,
  hint,
  completeLabel,
  completeKey,
  beat,
  onPress,
}: {
  /** The big number, already in the language's digits. */
  value: string;
  /** 0 to 1. */
  progress: number;
  /** Small word under the number ("left"), or nothing. */
  unit?: string;
  caption: string;
  /** Accessible name of the tap area. */
  label: string;
  hint: string;
  /** Shown and spoken when a set is complete. */
  completeLabel: string;
  /** Changes each time a set completes (0 = none yet); plays the completion moment. */
  completeKey: number;
  beat: DialBeat;
  onPress: () => void;
}) {
  const reduce = useReduceMotion();
  const [box, setBox] = useState({ w: 0, h: 0 });
  // Leave room for the caption line under the ring (it grows with the system font size), then let
  // the ring take what is left: small phones at font scale 1.3 get a smaller ring, never a cut caption.
  const captionRoom = Math.ceil(44 * PixelRatio.getFontScale()) + 12;
  const size = Math.max(88, Math.min(280, box.w * 0.78, box.h - captionRoom));

  // Motion for each beat. With reduce motion nothing moves: a short fade stands in for undo, reset and
  // switch, and taps have no motion at all (the haptic still says "counted").
  const scale = useSharedValue(1);
  const shiftX = useSharedValue(0);
  const shiftY = useSharedValue(0);
  const fade = useSharedValue(1);
  const ripple = useSharedValue(1);
  const rippleSize = useSharedValue(0.07);
  const rippleStrength = useSharedValue(0.35);
  useEffect(() => {
    if (beat.key === 0) return;
    const quick = { duration: 70, easing: easeOut };
    const back = { duration: duration.base, easing: easeOut };
    if (reduce) {
      if (beat.kind !== 'tap' && beat.kind !== 'milestone') {
        fade.set(0.4);
        fade.set(withTiming(1, back));
      }
      return;
    }
    switch (beat.kind) {
      case 'tap':
      case 'milestone': {
        const big = beat.kind === 'milestone';
        scale.set(withSequence(withTiming(big ? 1.12 : 1.06, quick), withSpring(1, springSoft)));
        rippleSize.set(big ? 0.16 : 0.07);
        rippleStrength.set(big ? 0.7 : 0.35);
        ripple.set(0);
        ripple.set(withTiming(1, { duration: big ? 650 : 380, easing: easeOut }));
        break;
      }
      case 'undo':
        scale.set(withSequence(withTiming(0.92, quick), withSpring(1, springSoft)));
        shiftY.set(withSequence(withTiming(6, quick), withSpring(0, springSoft)));
        break;
      case 'reset':
      case 'switch':
        fade.set(0);
        scale.set(0.85);
        fade.set(withTiming(1, back));
        scale.set(withSpring(1, springSoft));
        break;
      case 'blocked':
        shiftX.set(
          withSequence(
            withTiming(6, { duration: 50 }),
            withTiming(-6, { duration: 70 }),
            withTiming(4, { duration: 60 }),
            withTiming(0, { duration: 60 })
          )
        );
        break;
    }
    // Reanimated shared values are stable; the beat key alone decides when to play.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- plays once per beat
  }, [beat.key]);
  const numberStyle = useAnimatedStyle(() => ({
    opacity: fade.get(),
    transform: [{ translateX: shiftX.get() }, { translateY: shiftY.get() }, { scale: scale.get() }],
  }));
  const rippleStyle = useAnimatedStyle(() => ({
    opacity: rippleStrength.get() * (1 - ripple.get()),
    transform: [{ scale: 1 + ripple.get() * rippleSize.get() }],
  }));

  // The ring gives a little under the finger, like pressing a bead.
  const press = useSharedValue(0);
  const ringStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 - press.get() * 0.025 }] }));

  // Completion: a gold halo grows and fades, the check draws in (with its success haptic), and the
  // words stay for a moment. The next tap starts the new set at once.
  // The completion moment shows while `completeKey` is newer than the last one dismissed.
  const [dismissedKey, setDismissedKey] = useState(0);
  const showDone = completeKey !== 0 && completeKey !== dismissedKey;
  // 1 = faded out (rest). A completion sets it to 0 and lets it grow and fade again.
  const halo = useSharedValue(1);
  useEffect(() => {
    if (completeKey === 0) return;
    AccessibilityInfo.announceForAccessibility(completeLabel);
    if (!reduce) {
      halo.set(0);
      halo.set(withTiming(1, { duration: 900, easing: easeOut }));
    }
    const id = setTimeout(() => setDismissedKey(completeKey), 1800);
    return () => clearTimeout(id);
    // completeLabel is read at the moment of completion only.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- replays only when a new set completes
  }, [completeKey]);
  const haloStyle = useAnimatedStyle(() => ({
    opacity: reduce ? 0 : 0.6 * (1 - halo.get()),
    transform: [{ scale: 1 + halo.get() * 0.18 }],
  }));

  const handlePress = () => {
    setDismissedKey(completeKey);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={() => {
        if (!reduce) press.set(withTiming(1, { duration: 60 }));
      }}
      onPressOut={() => {
        press.set(withSpring(0, springSoft));
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityValue={{ text: showDone ? completeLabel : value }}
      onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
      className="flex-1 items-center justify-center gap-3 rounded-card"
      testID="zikr-tap-area"
    >
      {box.w > 0 ? (
        <>
          <Animated.View
            style={[{ width: size, height: size }, ringStyle]}
            className="items-center justify-center"
          >
            <Animated.View
              pointerEvents="none"
              className="absolute rounded-full border-2 border-gold"
              style={[{ width: size, height: size }, haloStyle]}
            />
            <Animated.View
              pointerEvents="none"
              className="absolute rounded-full border border-gold"
              style={[{ width: size, height: size }, rippleStyle]}
            />
            <ProgressRing
              progress={showDone ? 1 : progress}
              size={size}
              stroke={Math.round(size / 22)}
              color="gold"
              label={caption}
            >
              {showDone ? (
                <CompletionCheck play size={Math.round(size * 0.36)} label={completeLabel} />
              ) : (
                <Animated.View className="items-center" style={numberStyle}>
                  <Text
                    variant="display"
                    tabular
                    style={{
                      fontSize: Math.max(32, size * 0.27),
                      lineHeight: Math.max(40, size * 0.34),
                    }}
                    maxFontSizeMultiplier={1}
                  >
                    {value}
                  </Text>
                  {unit ? (
                    <Text variant="small" tone="muted" tight>
                      {unit}
                    </Text>
                  ) : null}
                </Animated.View>
              )}
            </ProgressRing>
          </Animated.View>
          <Text
            variant={showDone ? 'body' : 'small'}
            weight={showDone ? 'bold' : 'regular'}
            tone={showDone ? 'gold' : 'muted'}
            tabular
            className="text-center"
          >
            {showDone ? completeLabel : caption}
          </Text>
        </>
      ) : null}
    </Pressable>
  );
}
