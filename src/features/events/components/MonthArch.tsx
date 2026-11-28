import { useEffect, useState } from 'react';
import { I18nManager, useWindowDimensions, View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '@/theme/ThemeProvider';
import { ArchHero, archRadius } from '@/ui/Art';
import { duration, easeOut, useReduceMotion } from '@/ui/motion';
import { Text } from '@/ui/Text';

import type { HijriMonthView } from '../data/source';
import { BEADS, beadKind, beadPoint } from '../logic/beads';

// The arch's own padding and border (src/ui/Art.tsx), so the beads follow its dome.
const SIDE = 21;
const EDGE = 38;
const DAYS = Array.from({ length: BEADS }, (_, i) => i + 1);

/** The month as a string of beads along the dome. Decorative: the arch says the date in words. */
function Beads({ today, month, inset }: { today: number; month: HijriMonthView; inset: number }) {
  const theme = useTheme();
  const reduce = useReduceMotion();
  // Drawn from the screen width on the first frame, then from the measured width.
  const screenW = useWindowDimensions().width;
  const [measured, setW] = useState(0);
  const w = measured || Math.max(0, Math.min(screenW, 640) - 32 - 2 * SIDE);
  const r = Math.min(archRadius(w + 2 * SIDE) - EDGE, w / 2 - 12);
  const cx = w / 2;
  // `top` keeps today's halo inside the drawing when today is at the crown.
  const top = 14;
  const cy = r + top;
  const height = cy;
  const ink = theme.color('hero-ink');
  const gold = theme.color('hero-gold');
  const rtl = I18nManager.isRTL;
  const point = (day: number) => beadPoint(day, cx, cy, r, rtl);

  // Once per visit: the passed days light up from the 1st to today.
  const lit = useSharedValue(reduce ? 1 : 0);
  useEffect(() => {
    lit.set(reduce ? 1 : withTiming(1, { duration: duration.slow, easing: easeOut }));
  }, [lit, reduce]);
  const reveal = useAnimatedStyle(() => ({ width: lit.get() * w }));

  const bead = (day: number) => {
    const kind = beadKind(day, today);
    const p = point(day);
    if (kind === 'maybe') {
      return (
        <Circle
          key={day}
          cx={p.x}
          cy={p.y}
          r={3.2}
          fill="none"
          stroke={ink}
          strokeOpacity={0.6}
          strokeDasharray="1.6 1.6"
        />
      );
    }
    return month.marked.has(day) ? (
      <Circle
        key={day}
        cx={p.x}
        cy={p.y}
        r={3.8}
        fill={kind === 'past' ? ink : 'none'}
        fillOpacity={0.85}
        stroke={gold}
        strokeWidth={1.6}
      />
    ) : (
      <Circle
        key={day}
        cx={p.x}
        cy={p.y}
        r={3.2}
        fill={ink}
        fillOpacity={kind === 'past' ? 0.85 : 0.28}
      />
    );
  };
  const t = point(today);

  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      className="absolute end-0 start-0"
      style={{ top: EDGE - top - inset, height }}
    >
      <Svg width={w} height={height}>
        {DAYS.filter((d) => d > today).map(bead)}
      </Svg>
      <Animated.View
        className="absolute start-0 top-0 overflow-hidden"
        style={[{ height }, reveal]}
      >
        <Svg width={w} height={height} style={{ position: 'absolute', start: 0, top: 0 }}>
          {DAYS.filter((d) => d < today).map(bead)}
        </Svg>
      </Animated.View>
      <Animated.View
        className="absolute start-0 top-0"
        entering={FadeIn.delay(reduce ? 0 : duration.base).duration(duration.fast)}
      >
        <Svg width={w} height={height}>
          <Circle
            cx={t.x}
            cy={t.y}
            r={10}
            fill="none"
            stroke={gold}
            strokeOpacity={0.5}
            strokeWidth={2}
          />
          <Circle cx={t.x} cy={t.y} r={6} fill={gold} />
        </Svg>
      </Animated.View>
    </View>
  );
}

export interface MonthArchProps {
  /** Day of the Hijri month, 1-30. */
  today: number;
  month: HijriMonthView;
  dayNumber: string;
  monthYear: string;
  monthArabic: string;
  civilDate: string;
  /** Null when the Bengali calendar is off. */
  bengali: string | null;
  source: string;
  sample: string;
}

/** The tab's hero: today in every calendar, and where today sits in the Hijri month. */
export function MonthArch(p: MonthArchProps) {
  return (
    <View
      accessible
      accessibilityLabel={[
        `${p.dayNumber} ${p.monthYear}`,
        p.civilDate,
        ...(p.bengali ? [p.bengali] : []),
        p.source,
        p.sample,
      ].join(', ')}
    >
      <ArchHero testID="month-arch">
        {(inset: number) => (
          <View>
            <Beads today={p.today} month={p.month} inset={inset} />
            <View className="items-center pt-4">
              {/* Already large: these two grow less than the rest, so on a small phone with large text the
                  arch does not push today's events off the first screen. */}
              <Text
                variant="display"
                tone="hero"
                tight
                maxFontSizeMultiplier={1}
                className="self-stretch text-center"
              >
                {p.dayNumber}
              </Text>
              <Text
                variant="title"
                tone="heroGold"
                weight="bold"
                tight
                maxFontSizeMultiplier={1.15}
                className="self-stretch text-center"
              >
                {p.monthYear}
              </Text>
              <Text
                variant="lead"
                display
                tone="hero"
                className="self-stretch text-center"
                style={{ writingDirection: 'rtl', lineHeight: 32 }}
                accessibilityLanguage="ar"
              >
                {p.monthArabic}
              </Text>
              <Text variant="small" tone="hero" className="self-stretch text-center">
                {p.civilDate}
              </Text>
              {p.bengali ? (
                <Text variant="small" tone="hero" className="self-stretch text-center">
                  {p.bengali}
                </Text>
              ) : null}
              <View className="mt-2 rounded-full border border-hero-ink/25 px-3 py-1">
                <Text variant="caption" tone="hero" weight="semibold" tight className="text-center">
                  {`${p.source} · ${p.sample}`}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ArchHero>
    </View>
  );
}
