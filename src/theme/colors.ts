// A first slice of the design tokens (docs/06-UI-DESIGN.md section 1), enough for the P0 hello
// screen. Values are the web's `--c-*` RGB channels from frontend/src/styles/global.css.
// Phase 2 replaces this with the full token set, the theme resolver and a test that the values
// stay equal to the web's.

type Rgb = readonly [number, number, number];

const rgb = ([r, g, b]: Rgb): string => `rgb(${r}, ${g}, ${b})`;

const dark = {
  void: [14, 13, 10],
  ink: [255, 255, 255],
  emerald: [122, 158, 110],
  gold: [201, 169, 110],
} as const satisfies Record<string, Rgb>;

const light = {
  void: [237, 239, 226],
  ink: [31, 36, 24],
  emerald: [54, 81, 46],
  gold: [95, 74, 24],
} as const satisfies Record<string, Rgb>;

export type ColorName = keyof typeof dark;
export type Palette = Record<ColorName, string>;

const toPalette = (set: Record<ColorName, Rgb>): Palette =>
  Object.fromEntries(Object.entries(set).map(([name, value]) => [name, rgb(value)])) as Palette;

export const palettes = {
  dark: toPalette(dark),
  light: toPalette(light),
} as const;

export function paletteFor(scheme: 'light' | 'dark' | null | undefined): Palette {
  return scheme === 'light' ? palettes.light : palettes.dark;
}
