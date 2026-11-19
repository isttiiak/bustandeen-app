import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { duration, easeOut, useReduceMotion } from '@/ui/motion';
import { Text } from '@/ui/Text';

const MAX = 5;

function Bar({
  value,
  index,
  today,
  height,
  label,
}: {
  value: number;
  index: number;
  today: boolean;
  height: number;
  label: string;
}) {
  const reduce = useReduceMotion();
  const grow = useSharedValue(reduce ? 1 : 0);
  useEffect(() => {
    grow.set(
      reduce
        ? 1
        : withDelay(index * 60, withTiming(1, { duration: duration.slow, easing: easeOut }))
    );
  }, [reduce, index, grow]);
  const style = useAnimatedStyle(() => ({
    height: Math.max(6, (value / MAX) * height * grow.get()),
  }));
  return (
    <View className="flex-1 items-center gap-1.5">
      <View style={{ height }} className="w-full items-center justify-end">
        <Animated.View
          style={style}
          className={`w-3/5 rounded-full ${today ? 'bg-gold' : value >= MAX ? 'bg-emerald' : 'bg-emerald/45'}`}
        />
      </View>
      <Text
        variant="caption"
        tone={today ? 'gold' : 'muted'}
        weight={today ? 'bold' : 'regular'}
        tight
      >
        {label}
      </Text>
    </View>
  );
}

/** Seven bars, one per day, growing in. Today is gold; a full day is solid. */
export function WeekBars({
  values,
  todayIndex,
  labels,
  height = 96,
}: {
  values: readonly number[];
  todayIndex: number;
  labels: readonly string[];
  height?: number;
}) {
  return (
    <View
      className="flex-row gap-1"
      accessible
      accessibilityLabel={values.map((v, i) => `${labels[i]} ${v}/${MAX}`).join(', ')}
    >
      {values.map((v, i) => (
        <Bar
          key={i}
          value={v}
          index={i}
          today={i === todayIndex}
          height={height}
          label={labels[i]}
        />
      ))}
    </View>
  );
}
