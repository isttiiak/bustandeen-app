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
  'chevron-start': 'M15 19l-7-7 7-7',
  undo: 'M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3',
  refresh:
    'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  warning:
    'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  offline: 'M18.364 5.636a9 9 0 010 12.728M5.636 18.364a9 9 0 010-12.728M3 3l18 18',
  home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  book: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  dots: 'M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z',
  counter: 'M12 3a9 9 0 100 18 9 9 0 000-18zm0 6a3 3 0 100 6 3 3 0 000-6z',
  fire: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657zM9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z',
  sun: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
  location:
    'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z',
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
