import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useTheme } from '@/theme/ThemeProvider';

/**
 * The arch hero: the one arch per screen (doc 06 section 4). Rounded top like a mihrab, soft bottom
 * corners. Never use two on one screen.
 */
export function ArchHero({ children, testID }: { children?: ReactNode; testID?: string }) {
  return (
    <View
      testID={testID}
      className="overflow-hidden border border-border bg-hero p-5"
      style={{
        borderTopStartRadius: 88,
        borderTopEndRadius: 88,
        borderBottomStartRadius: 20,
        borderBottomEndRadius: 20,
      }}
    >
      {children}
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
