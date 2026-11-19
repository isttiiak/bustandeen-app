import { render, screen } from '@testing-library/react-native';
import { StyleSheet, type TextStyle } from 'react-native';

import { fonts } from '@/theme/fonts';
import { tokens, type ColorName, type Rgb, type ThemeName } from '@/theme/tokens';
import { containsBangla, Text, textVariants, variantSpecs } from '@/ui/Text';

const style = (el: { props: { style?: unknown } }) =>
  StyleSheet.flatten(el.props.style as TextStyle) as TextStyle;

describe('Text', () => {
  it('follows the type scale', () => {
    expect(textVariants.map((v) => variantSpecs[v].size)).toEqual([36, 30, 24, 20, 18, 16, 14, 12]);
  });

  it('sets Latin body in Plus Jakarta Sans and headings in El Messiri', async () => {
    await render(
      <>
        <Text>Prayer times</Text>
        <Text variant="h1">Today</Text>
      </>
    );
    expect(style(screen.getByText('Prayer times'))).toMatchObject({
      fontFamily: fonts.body,
      fontSize: 16,
    });
    expect(style(screen.getByText('Today'))).toMatchObject({
      fontFamily: fonts.display,
      fontSize: 30,
    });
    expect(screen.getByRole('header')).toHaveTextContent('Today');
  });

  it('sets text with Bangla letters in Hind Siliguri with the taller line height', async () => {
    await render(<Text>আজই আপনার যাত্রা</Text>);
    const s = style(screen.getByText('আজই আপনার যাত্রা'));
    expect(s.fontFamily).toBe(fonts.bangla);
    expect(s.lineHeight).toBe(Math.round(16 * 1.65));
  });

  it('never shrinks Bangla to its own width (Android measurement bug, doc 06 s3)', async () => {
    await render(<Text>আজই</Text>);
    expect(style(screen.getByText('আজই'))).toMatchObject({ alignSelf: 'stretch' });
  });

  it('uses the script prop when children are not a plain string', async () => {
    await render(
      <Text script="bangla" testID="outer">
        <Text script="bangla">আজই</Text>
      </Text>
    );
    expect(style(screen.getByTestId('outer')).fontFamily).toBe(fonts.bangla);
  });

  it('can use tabular figures for times and counts', async () => {
    await render(<Text tabular>05:12</Text>);
    expect(style(screen.getByText('05:12')).fontVariant).toEqual(['tabular-nums']);
  });

  it('caps hero text sooner than body when the system font scale is large', async () => {
    await render(
      <>
        <Text variant="display">Bustandeen</Text>
        <Text>Body</Text>
      </>
    );
    expect(screen.getByText('Bustandeen').props.maxFontSizeMultiplier).toBe(1.5);
    expect(screen.getByText('Body').props.maxFontSizeMultiplier).toBe(2);
  });

  it('detects Bangla in strings and arrays of strings only', () => {
    expect(containsBangla('আজই')).toBe(true);
    expect(containsBangla(['Row ', 'আজই'])).toBe(true);
    expect(containsBangla('Prayer')).toBe(false);
    expect(containsBangla(12)).toBe(false);
  });
});

// Contrast of the text tones over the surfaces they sit on (doc 06 section 1: body text 4.5:1,
// large text and icons 3:1). `muted` is ink at 70%, `faint` ink at 50% (about 3:1; on the light hero 2.9:1, so only for decoration and placeholders,
// never for information).
const channel = (v: number) => {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const luminance = ([r, g, b]: Rgb) =>
  0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
const blend = (fg: Rgb, bg: Rgb, alpha: number): Rgb =>
  fg.map((v, i) => Math.round(alpha * v + (1 - alpha) * bg[i])) as unknown as Rgb;
const contrast = (a: Rgb, b: Rgb) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

describe('text tone contrast', () => {
  const surfaces: ColorName[] = ['void', 'deep', 'surface', 'hero'];
  for (const theme of ['dark', 'light'] as ThemeName[]) {
    const t = tokens[theme];
    for (const bg of surfaces) {
      it(`${theme} on ${bg}`, () => {
        expect(contrast(t.ink, t[bg])).toBeGreaterThanOrEqual(4.5);
        expect(contrast(blend(t.ink, t[bg], 0.7), t[bg])).toBeGreaterThanOrEqual(4.5);
        expect(contrast(blend(t.ink, t[bg], 0.5), t[bg])).toBeGreaterThanOrEqual(2.9);
        for (const accent of ['gold', 'emerald', 'danger'] as ColorName[]) {
          expect(contrast(t[accent], t[bg])).toBeGreaterThanOrEqual(4.5);
        }
      });
    }
  }
});
