import { I18nManager } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useTheme } from '@/theme/ThemeProvider';
import type { ColorName } from '@/theme/tokens';

// Icons are SVG only, no emoji (docs/06-UI-DESIGN.md section 5). 24x24 outline paths from the
// Heroicons set (MIT). Add an icon here when a screen needs one.
const paths = {
  check: 'M5 13l4 4L19 7',
  close: 'M6 18L18 6M6 6l12 12',
  plus: 'M12 4v16m8-8H4',
  minus: 'M20 12H4',
  'chevron-end': 'M9 5l7 7-7 7',
  'chevron-down': 'M19 9l-7 7-7-7',
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  warning:
    'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  offline: 'M18.364 5.636a9 9 0 010 12.728M5.636 18.364a9 9 0 010-12.728M3 3l18 18',
  moon: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z',
} as const;

export type IconName = keyof typeof paths;

export interface IconProps {
  name: IconName;
  size?: number;
  color?: ColorName;
  /** Directional icons (back, next) flip in right-to-left layouts. */
  mirrorInRtl?: boolean;
}

/** Decorative by default: hidden from screen readers. The control around it carries the label. */
export function Icon({ name, size = 24, color = 'ink', mirrorInRtl }: IconProps) {
  const theme = useTheme();
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={theme.color(color)}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={mirrorInRtl ? { transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }] } : undefined}
    >
      <Path d={paths[name]} />
    </Svg>
  );
}
