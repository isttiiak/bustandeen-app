import Svg, { Circle, Defs, Line, Path, RadialGradient, Stop } from 'react-native-svg';

import { useTheme } from '@/theme/ThemeProvider';

const RAYS = Array.from({ length: 12 }, (_, i) => (i * Math.PI) / 6);

/**
 * The sun for the sky arc: a soft halo, twelve short rays, a bright core with a lighter heart. It is
 * gold in every theme so it always reads as the sun. `size` is the square it is drawn in.
 */
export function Sun({ size = 44 }: { size?: number }) {
  const theme = useTheme();
  const gold = theme.color('hero-gold');
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Defs>
        <RadialGradient id="sunHalo" cx="50%" cy="50%" r="50%">
          <Stop offset="0.35" stopColor={gold} stopOpacity="0.55" />
          <Stop offset="1" stopColor={gold} stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="sunCore" cx="40%" cy="38%" r="70%">
          <Stop offset="0" stopColor="#FFF6D6" stopOpacity="1" />
          <Stop offset="0.55" stopColor={gold} stopOpacity="1" />
          <Stop offset="1" stopColor={gold} stopOpacity="1" />
        </RadialGradient>
      </Defs>
      <Circle cx={24} cy={24} r={24} fill="url(#sunHalo)" />
      {RAYS.map((a, i) => (
        <Line
          key={a}
          x1={24 + Math.cos(a) * 12.5}
          y1={24 + Math.sin(a) * 12.5}
          x2={24 + Math.cos(a) * (i % 2 === 0 ? 19 : 16.5)}
          y2={24 + Math.sin(a) * (i % 2 === 0 ? 19 : 16.5)}
          stroke={gold}
          strokeWidth={i % 2 === 0 ? 2.4 : 1.8}
          strokeLinecap="round"
        />
      ))}
      <Circle cx={24} cy={24} r={9.5} fill="url(#sunCore)" />
    </Svg>
  );
}

/** A crescent moon for the night, when the sun is below the horizon. */
export function Moon({ size = 44 }: { size?: number }) {
  const theme = useTheme();
  const ink = theme.color('hero-ink');
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Defs>
        <RadialGradient id="moonHalo" cx="50%" cy="50%" r="50%">
          <Stop offset="0.4" stopColor={ink} stopOpacity="0.3" />
          <Stop offset="1" stopColor={ink} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Circle cx={24} cy={24} r={24} fill="url(#moonHalo)" />
      <Path d="M28 11 A13 13 0 0 0 28 37 A22 22 0 0 1 28 11 Z" fill={ink} />
    </Svg>
  );
}
