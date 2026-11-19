import { useState } from 'react';
import { I18nManager, Switch as RNSwitch, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { useTheme } from '@/theme/ThemeProvider';

import { haptic } from './haptics';
import { duration, easeOut, useReduceMotion } from './motion';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

/** A chosen / not chosen tile (Settings, pickers). `multi` makes it a checkbox, else a radio. */
export function Option({
  label,
  description,
  selected,
  onPress,
  multi,
  testID,
}: {
  label: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
  multi?: boolean;
  testID?: string;
}) {
  return (
    <PressableScale
      haptic="select"
      onPress={onPress}
      accessibilityRole={multi ? 'checkbox' : 'radio'}
      accessibilityState={{ selected, checked: selected }}
      accessibilityLabel={description ? `${label}, ${description}` : label}
      testID={testID}
      className={`min-h-12 justify-center rounded-control border p-3 ${
        selected ? 'border-emerald bg-emerald/10' : 'border-border bg-surface/50'
      }`}
    >
      <Text weight={selected ? 'bold' : 'medium'}>{label}</Text>
      {description ? (
        <Text variant="small" tone="muted">
          {description}
        </Text>
      ) : null}
    </PressableScale>
  );
}

/** A small pill: a filter, a tag, a status. Selectable when `onPress` is given. */
export function Chip({
  label,
  selected,
  onPress,
  testID,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  testID?: string;
}) {
  const classes = `min-h-8 flex-row items-center rounded-full border px-3 py-1 ${
    selected ? 'border-emerald bg-emerald/10' : 'border-border bg-surface/50'
  }`;
  const text = (
    <Text tight variant="small" weight={selected ? 'bold' : 'medium'}>
      {label}
    </Text>
  );
  if (!onPress) {
    return (
      <View className={classes} testID={testID}>
        {text}
      </View>
    );
  }
  return (
    <PressableScale
      haptic="select"
      hitSlop={8}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!selected }}
      testID={testID}
      className={classes}
    >
      {text}
    </PressableScale>
  );
}

export interface SegmentedProps<T extends string> {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  testID?: string;
}

/** A row of exclusive choices with a thumb that slides to the chosen one. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  testID,
}: SegmentedProps<T>) {
  const [width, setWidth] = useState(0);
  const reduce = useReduceMotion();
  // With large system text, four or more labels no longer fit side by side and would break inside
  // words, so they stack (the chosen one is filled instead of a sliding thumb).
  const { fontScale } = useWindowDimensions();
  const stacked = fontScale > 1.3 && options.length > 3;
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value)
  );
  const segment = width > 0 ? (width - 8) / options.length : 0;
  const sign = I18nManager.isRTL ? -1 : 1;

  const thumb = useAnimatedStyle(() => ({
    width: segment,
    transform: [
      {
        translateX: reduce
          ? sign * index * segment
          : withTiming(sign * index * segment, { duration: duration.base, easing: easeOut }),
      },
    ],
  }));

  return (
    <View
      accessibilityRole="radiogroup"
      testID={testID}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      className={`min-h-12 rounded-control border border-border bg-surface/50 p-1 ${stacked ? 'gap-1' : 'flex-row'}`}
    >
      {segment > 0 && !stacked ? (
        <Animated.View
          pointerEvents="none"
          className="absolute bottom-1 start-1 top-1 rounded-control bg-emerald-dim"
          style={thumb}
        />
      ) : null}
      {options.map((o) => {
        const on = o.value === value;
        return (
          <PressableScale
            key={o.value}
            haptic={false}
            onPress={() => {
              if (!on) {
                haptic('select');
                onChange(o.value);
              }
            }}
            accessibilityRole="radio"
            accessibilityState={{ selected: on, checked: on }}
            accessibilityLabel={o.label}
            containerClassName={stacked ? undefined : 'flex-1'}
            className={`min-h-10 items-center justify-center rounded-control px-1 ${stacked ? (on ? 'bg-emerald-dim' : '') : 'flex-1'}`}
          >
            <Text
              tight
              variant="small"
              weight="bold"
              tone={on ? 'onColor' : 'muted'}
              className="text-center"
            >
              {o.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

/** The platform switch, coloured from the theme, with a haptic tick. */
export function Switch({
  value,
  onValueChange,
  label,
  testID,
}: {
  value: boolean;
  onValueChange: (value: boolean) => void;
  /** Required: names what the switch controls for screen readers. */
  label: string;
  testID?: string;
}) {
  const theme = useTheme();
  return (
    <RNSwitch
      value={value}
      onValueChange={(v) => {
        haptic('select');
        onValueChange(v);
      }}
      accessibilityLabel={label}
      accessibilityRole="switch"
      testID={testID}
      trackColor={{ false: theme.color('border'), true: theme.color('emerald-dim') }}
      thumbColor={theme.color('on-color')}
      ios_backgroundColor={theme.color('border')}
    />
  );
}
