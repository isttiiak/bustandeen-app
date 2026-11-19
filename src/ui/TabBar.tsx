import { useState } from 'react';
import { I18nManager, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { haptic } from './haptics';
import { Icon, type IconName } from './Icon';
import { springSoft, useReduceMotion } from './motion';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

// The shape of the navigator's tab bar props that this bar uses, so `src/ui` does not depend on the
// navigation library. Expo Router's `Tabs` passes props that satisfy it.
export interface TabBarProps {
  state: { index: number; routes: readonly { key: string; name: string }[] };
  descriptors: Record<string, { options: { title?: string; tabBarAccessibilityLabel?: string } }>;
  emitter: {
    emit: (event: { type: 'tabPress'; target: string; canPreventDefault: true }) => {
      defaultPrevented: boolean;
    };
  };
  navigateToTab: (routeKey: string) => void;
  icons: Record<string, IconName>;
}

/**
 * The app's bottom tab bar: an indicator pill that glides to the chosen tab, a light haptic tick on
 * press, large touch targets and a label under each icon (a label is always shown, never icon-only).
 */
export function TabBar({ state, descriptors, emitter, navigateToTab, icons }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const reduce = useReduceMotion();
  const [width, setWidth] = useState(0);
  const count = state.routes.length;
  const slot = width / count;
  const sign = I18nManager.isRTL ? -1 : 1;

  const pill = useAnimatedStyle(() => ({
    width: slot,
    transform: [
      {
        translateX: reduce
          ? sign * state.index * slot
          : withSpring(sign * state.index * slot, springSoft),
      },
    ],
  }));

  return (
    <View
      accessibilityRole="tablist"
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      className="border-t border-border bg-deep px-0 pt-2"
      style={{ paddingBottom: Math.max(insets.bottom, 8) }}
    >
      {slot > 0 ? (
        <Animated.View
          pointerEvents="none"
          className="absolute start-0 top-2 items-center"
          style={pill}
        >
          <View className="h-8 w-16 rounded-full bg-emerald/15" />
        </Animated.View>
      ) : null}
      <View className="flex-row">
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const label = descriptors[route.key]?.options.title ?? route.name;
          return (
            <PressableScale
              key={route.key}
              haptic={false}
              containerClassName="flex-1"
              className="min-h-14 items-center justify-center gap-0.5"
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={descriptors[route.key]?.options.tabBarAccessibilityLabel ?? label}
              onPress={() => {
                const event = emitter.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  haptic('tick');
                  navigateToTab(route.key);
                }
              }}
            >
              <View className="h-8 w-16 items-center justify-center">
                <Icon
                  name={icons[route.name] ?? 'dots'}
                  size={22}
                  color={focused ? 'emerald' : 'ink'}
                />
              </View>
              <Text
                variant="caption"
                weight={focused ? 'bold' : 'medium'}
                tone={focused ? 'emerald' : 'muted'}
                tight
              >
                {label}
              </Text>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}
