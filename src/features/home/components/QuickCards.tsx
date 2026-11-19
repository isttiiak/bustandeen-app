import { useEffect, type ReactNode } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Card } from '@/ui/Card';
import { ProgressRing } from '@/ui/Feedback';
import { Icon, type IconName } from '@/ui/Icon';
import { useReduceMotion } from '@/ui/motion';
import { Text } from '@/ui/Text';

/** Shell of a small Home card: icon and title on top, the value below. The whole card is a button. */
export function QuickCard({
  icon,
  title,
  onPress,
  label,
  calling,
  children,
}: {
  icon: IconName;
  title: string;
  onPress: () => void;
  label: string;
  /** Show the soft calling rings (empty zikr card). */
  calling?: boolean;
  children: ReactNode;
}) {
  return (
    <Card
      onPress={onPress}
      accessibilityLabel={label}
      className="min-h-36 justify-between overflow-hidden p-4"
    >
      {calling ? <CallingRings /> : null}
      <View className="flex-row items-center gap-2">
        <Icon name={icon} size={18} color="gold" />
        <Text variant="small" tone="muted" weight="semibold" tight className="flex-1">
          {title}
        </Text>
        <Icon name="chevron-end" size={14} color="gold-dim" mirrorInRtl />
      </View>
      <View className="items-start">{children}</View>
    </Card>
  );
}

/** Soft rings that breathe from the card's corner on an empty zikr card, like a call going out. */
function CallingRings() {
  const reduce = useReduceMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    if (reduce) return;
    t.set(
      withRepeat(
        withSequence(withTiming(1, { duration: 2600 }), withTiming(0, { duration: 2600 })),
        -1
      )
    );
  }, [reduce, t]);
  const inner = useAnimatedStyle(() => ({
    opacity: 0.5 - t.get() * 0.3,
    transform: [{ scale: 1 + t.get() * 0.18 }],
  }));
  const outer = useAnimatedStyle(() => ({
    opacity: 0.3 - t.get() * 0.2,
    transform: [{ scale: 1 + t.get() * 0.12 }],
  }));
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="absolute -bottom-10 -end-10 h-36 w-36 items-center justify-center"
    >
      <Animated.View className="absolute h-36 w-36 rounded-full border border-gold" style={outer} />
      <Animated.View className="absolute h-24 w-24 rounded-full border border-gold" style={inner} />
    </View>
  );
}

/**
 * The value of a counter card, by one rule (owner, 2026-11-19): a count today if there is one, else
 * the running streak as a big number, else just the word. `calling` adds the breathing ring.
 */
export function CounterValue({
  count,
  streak,
  countLabel,
  streakLabel,
  word,
  num,
}: {
  count: number;
  streak: number;
  countLabel: string;
  streakLabel: string;
  word: string;
  num: (n: number) => string;
}) {
  if (count > 0 || streak > 0) {
    const isCount = count > 0;
    return (
      <View>
        <View className="flex-row items-center gap-1.5">
          {!isCount ? <Icon name="fire" size={22} color="warm" /> : null}
          <Text variant="display" tabular>
            {num(isCount ? count : streak)}
          </Text>
        </View>
        <Text variant="caption" tone="muted">
          {isCount ? countLabel : streakLabel}
        </Text>
      </View>
    );
  }
  return (
    <View className="justify-center">
      <Text variant="h1" tone="gold" display>
        {word}
      </Text>
    </View>
  );
}

/** Tracker card value: a small ring with done over five. */
export function TrackerValue({
  done,
  total,
  label,
  num,
}: {
  done: number;
  total: number;
  label: string;
  num: (n: number) => string;
}) {
  return (
    <ProgressRing progress={done / total} size={64} stroke={7} label={label}>
      <Text variant="small" weight="bold" tabular tight>{`${num(done)}/${num(total)}`}</Text>
    </ProgressRing>
  );
}
