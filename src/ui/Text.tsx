import type { ReactNode } from 'react';
import {
  StyleSheet,
  Text as RNText,
  type TextProps as RNTextProps,
  type TextStyle,
} from 'react-native';

import { fonts } from '@/theme/fonts';

// The one text component (docs/06-UI-DESIGN.md section 3). Variants follow the type scale
// 12, 14, 16, 18, 20, 24, 30, 36 sp. Latin text uses El Messiri (headings) or Plus Jakarta Sans;
// text containing Bangla uses Hind Siliguri, so a Bangla line never falls back to the system font.

export const textVariants = [
  'display',
  'h1',
  'h2',
  'title',
  'lead',
  'body',
  'small',
  'caption',
] as const;
export type TextVariant = (typeof textVariants)[number];

export type TextTone =
  'ink' | 'muted' | 'faint' | 'gold' | 'emerald' | 'danger' | 'onColor' | 'hero';
export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';
export type TextScript = 'latin' | 'bangla';

interface VariantSpec {
  size: number;
  /** Latin line height; Bangla uses 1.65 x size (doc 06: 1.6-1.7). */
  line: number;
  heading: boolean;
  weight: TextWeight;
  /** Largest system font scale this variant follows; hero text stops sooner so layouts hold. */
  maxScale: number;
}

export const variantSpecs: Record<TextVariant, VariantSpec> = {
  display: { size: 36, line: 48, heading: true, weight: 'bold', maxScale: 1.5 },
  h1: { size: 30, line: 42, heading: true, weight: 'bold', maxScale: 1.5 },
  h2: { size: 24, line: 34, heading: true, weight: 'bold', maxScale: 1.8 },
  title: { size: 20, line: 28, heading: false, weight: 'semibold', maxScale: 2 },
  lead: { size: 18, line: 27, heading: false, weight: 'regular', maxScale: 2 },
  body: { size: 16, line: 24, heading: false, weight: 'regular', maxScale: 2 },
  small: { size: 14, line: 21, heading: false, weight: 'regular', maxScale: 2 },
  caption: { size: 12, line: 18, heading: false, weight: 'regular', maxScale: 2 },
};

export const BANGLA_LINE_RATIO = 1.65;
export const BANGLA_TIGHT_RATIO = 1.35;

// Literal class names so Tailwind can see them. `muted` and `faint` are the ink opacity steps of
// doc 06 section 1 (70 and 50). `faint` reaches only about 3:1 (2.9:1 on the light hero), so it is for decoration and
// placeholders, never for information; a test checks both steps in both themes.
const toneClass: Record<TextTone, string> = {
  ink: 'text-ink',
  muted: 'text-ink/70',
  faint: 'text-ink/50',
  gold: 'text-gold',
  emerald: 'text-emerald',
  danger: 'text-danger',
  /** Always-white text on a solid coloured fill. */
  onColor: 'text-on-color',
  /** Text on the hero card: it has its own ink because the hero is light in the mixed theme. */
  hero: 'text-hero-ink',
};

const weightValue: Record<TextWeight, TextStyle['fontWeight']> = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

const BANGLA = /[ঀ-৿]/;

/** True when the visible text contains Bangla letters. Only plain string children are scanned. */
export function containsBangla(children: unknown): boolean {
  if (typeof children === 'string') return BANGLA.test(children);
  if (Array.isArray(children)) return children.some(containsBangla);
  return false;
}

/**
 * Where Bangla text must shrink to its content (button labels, chips, row items), Android measures
 * it about 2.5% narrower than it draws it and wraps the last word onto a second line that the
 * parent has no height for (doc 06 section 3). Padding does not help (it is outside the text's
 * width), so the string gets trailing no-break spaces: they count in the measured width, add no
 * visible mark and are trimmed by screen readers and test queries.
 */
export function withBanglaSlack(children: ReactNode, centered = false): ReactNode {
  if (typeof children !== 'string') return children;
  const pad = '\u00A0'.repeat(Math.max(1, Math.ceil(children.length * 0.085)));
  // Centred text gets the same slack on both sides, so its middle does not move.
  return centered ? pad + children + pad : children + pad;
}

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  tone?: TextTone;
  weight?: TextWeight;
  /** Set when the text is not a plain string (nested elements), so the right font is used. */
  script?: TextScript;
  /** Use the heading font (El Messiri) for a non-heading variant, e.g. a section title. */
  display?: boolean;
  /** Single-line control label (button, chip, tab): Bangla gets a tighter line height so the label
   *  sits in the middle of its control instead of near the top. */
  tight?: boolean;
  /** Tabular figures: use for times and counts so digits do not jump. */
  tabular?: boolean;
}

export function Text({
  variant = 'body',
  tone = 'ink',
  weight,
  script,
  tabular,
  display,
  tight,
  className,
  style,
  children,
  accessibilityRole,
  ...rest
}: TextProps) {
  const spec = variantSpecs[variant];
  const bangla = (script ?? (containsBangla(children) ? 'bangla' : 'latin')) === 'bangla';

  const centered =
    !!className?.includes('text-center') || StyleSheet.flatten(style)?.textAlign === 'center';

  const base: TextStyle = {
    fontFamily: bangla ? fonts.bangla : spec.heading || display ? fonts.display : fonts.body,
    fontSize: spec.size,
    lineHeight: bangla
      ? Math.round(spec.size * (tight ? BANGLA_TIGHT_RATIO : BANGLA_LINE_RATIO))
      : spec.line,
    fontWeight: weightValue[weight ?? spec.weight],
    ...(tabular ? { fontVariant: ['tabular-nums'] } : null),
    // Bangla text may shrink to its content only with the trailing slack of `withBanglaSlack`
    // (Android measures Hind Siliguri narrower than it draws it; doc 06 section 3).
    ...(bangla ? { flexShrink: 1 } : null),
  };

  return (
    <RNText
      accessibilityRole={accessibilityRole ?? (spec.heading ? 'header' : undefined)}
      maxFontSizeMultiplier={spec.maxScale}
      className={className ? `${toneClass[tone]} ${className}` : toneClass[tone]}
      style={[base, style]}
      {...rest}
    >
      {bangla ? withBanglaSlack(children, centered) : children}
    </RNText>
  );
}
