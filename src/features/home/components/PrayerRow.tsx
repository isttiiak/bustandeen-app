import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Icon } from '@/ui/Icon';
import { springSoft, useReduceMotion } from '@/ui/motion';
import { PressableScale } from '@/ui/PressableScale';
import { Text } from '@/ui/Text';

export interface PrayerRowProps {
  name: string;
  time: string;
  /** Sunrise: shown, but nothing to log. */
  tracked: boolean;
  done: boolean;
  isNext: boolean;
  doneLabel: string;
  actionLabel: string;
  onToggle: () => void;
}

/** One line of the day: name, time, and a 48 dp check that pops when you mark the prayer done. */
export function PrayerRow({
  name,
  time,
  tracked,
  done,
  isNext,
  doneLabel,
  actionLabel,
  onToggle,
}: PrayerRowProps) {
  const reduce = useReduceMotion();
  const pop = useSharedValue(1);
  useEffect(() => {
    if (done && !reduce)
      pop.set(withSequence(withTiming(1.25, { duration: 110 }), withSpring(1, springSoft)));
    // `pop` is a stable shared value; only a change of `done` should replay the pop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);
  const check = useAnimatedStyle(() => ({ transform: [{ scale: pop.get() }] }));

  return (
    <View
      className={`min-h-14 flex-row items-center gap-3 px-4 ${isNext ? 'bg-emerald/10' : ''}`}
      accessible={!tracked}
      accessibilityLabel={!tracked ? `${name}, ${time}` : undefined}
    >
      <View className={`h-8 w-1 rounded-full ${isNext ? 'bg-emerald' : 'bg-transparent'}`} />
      <View className="flex-1">
        <Text weight={isNext ? 'bold' : 'medium'} tone={tracked ? 'ink' : 'muted'}>
          {name}
        </Text>
      </View>
      <Text tabular weight={isNext ? 'bold' : 'medium'} tone={tracked ? 'ink' : 'muted'}>
        {time}
      </Text>
      {tracked ? (
        <PressableScale
          haptic={done ? 'tick' : 'medium'}
          onPress={onToggle}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: done }}
          accessibilityLabel={`${name}: ${done ? doneLabel : ''}`.trim()}
          accessibilityHint={actionLabel}
          className="h-12 w-12 items-center justify-center"
        >
          <Animated.View
            style={check}
            className={`h-8 w-8 items-center justify-center rounded-full border-2 ${done ? 'border-emerald bg-emerald-dim' : 'border-border'}`}
          >
            {done ? <Icon name="check" size={18} color="on-color" /> : null}
          </Animated.View>
        </PressableScale>
      ) : (
        <View className="h-12 w-12 items-center justify-center">
          <Icon name="sun" size={20} color="gold" />
        </View>
      )}
    </View>
  );
}
