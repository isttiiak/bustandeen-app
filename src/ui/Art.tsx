import { useState, type ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';

import { useTheme } from '@/theme/ThemeProvider';

/** Dome radius for a card `width` dp wide: a true half-circle top on phones, capped on tablets so the
 *  dome never grows taller than it is useful. */
export function archRadius(width: number): number {
  return Math.round(Math.min(width / 2, 200));
}

/** Top padding that keeps the first line inside the dome: at 0.3 of the radius the dome is still
 *  about 1.4 radii wide, which fits a short label. */
export function archTopInset(width: number): number {
  return Math.round(archRadius(width) * 0.3) + 8;
}

const ARCH_BOTTOM = 28;

/**
 * The arch hero: the one arch per screen (doc 06 section 4). A true dome (radius = half the card
 * width, so it fits every phone and tablet), soft bottom corners, a quiet glow and two thin inner
 * arches drawn like a mihrab. Never use two on one screen. `contentTopInset` is passed to children
 * through `renderInset` when they need it.
 */
export function ArchHero({
  children,
  testID,
}: {
  children?: ReactNode | ((inset: number) => ReactNode);
  testID?: string;
}) {
  const theme = useTheme();
  const [size, setSize] = useState({ w: 0, h: 0 });
  const r = size.w > 0 ? archRadius(size.w) : 140;
  const inset = size.w > 0 ? archTopInset(size.w) : 52;
  const ink = theme.color('hero-ink');
  const { w, h } = size;
  const arch = (d: number) => {
    const rr = Math.max(0, r - d);
    return `M ${d} ${h - ARCH_BOTTOM} L ${d} ${r} A ${rr} ${rr} 0 0 1 ${w - d} ${r} L ${w - d} ${h - ARCH_BOTTOM}`;
  };
  return (
    <View
      testID={testID}
      onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
      className="overflow-hidden border border-border bg-hero px-5 pb-5"
      style={{
        paddingTop: inset,
        borderTopStartRadius: r,
        borderTopEndRadius: r,
        borderBottomStartRadius: ARCH_BOTTOM,
        borderBottomEndRadius: ARCH_BOTTOM,
      }}
    >
      {w > 0 ? (
        <Svg
          width={w}
          height={h}
          style={{ position: 'absolute', start: 0, top: 0 }}
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Defs>
            <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={ink} stopOpacity="0.2" />
              <Stop offset="1" stopColor={ink} stopOpacity="0" />
            </RadialGradient>
            <LinearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={ink} stopOpacity="0.28" />
              <Stop offset="0.7" stopColor={ink} stopOpacity="0.06" />
              <Stop offset="1" stopColor={ink} stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Circle cx={w / 2} cy={r * 0.7} r={r * 1.05} fill="url(#glow)" />
          <Path d={arch(9)} stroke="url(#fade)" strokeWidth={1.25} fill="none" />
          <Path d={arch(19)} stroke="url(#fade)" strokeWidth={0.75} fill="none" opacity={0.6} />
        </Svg>
      ) : null}
      {typeof children === 'function' ? children(inset) : children}
    </View>
  );
}

// Leaf shapes of the brand mark (the web's src/brand/brandMark.ts LEAF and LEAF_WARM paths).
const LEAF = 'M262 270C282 238 318 224 362 234C342 270 302 284 262 270Z';
const LEAF_WARM = 'M284 232C254 222 234 192 236 156C266 172 286 198 284 232Z';

/** Two small leaves: a quiet decorative mark. Hidden from screen readers. */
export function LeafMark({ size = 28 }: { size?: number }) {
  const theme = useTheme();
  return (
    <Svg
      width={size}
      height={size}
      viewBox="228 150 142 130"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Path d={LEAF} fill={theme.color('data-good')} />
      <Path d={LEAF_WARM} fill={theme.color('warm')} />
    </Svg>
  );
}
