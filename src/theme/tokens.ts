// Colour tokens (docs/06-UI-DESIGN.md section 1). Values are the web's `--c-*` RGB channels from
// frontend/src/styles/global.css (`bustandeen` = dark, `bustandeen-light` = sage paper). A test
// reads that file and fails if the two drift apart. `ink` is the text colour of the theme (the web
// calls it `white`); `danger-soft` / `danger` are the web's `red-300` / `red-400`.

/** Tokens that exist only in the app (no `--c-*` twin on the web): `on-color` is always-white text on
 *  a solid coloured fill (doc 06 section 1). The web-equality test skips these. */
export const appOnlyTokens = ['on-color', 'hero-ink', 'hero-gold', 'hero-danger'] as const;

export type Rgb = readonly [number, number, number];

export const themeNames = ['dark', 'light', 'night', 'sand'] as const;
/** The two themes the web has; the rest are app-only palettes (doc 06 section 0, decision O22). */
export const webThemeNames = ['dark', 'light'] as const;
export type ThemeName = (typeof themeNames)[number];

const dark = {
  void: [14, 13, 10],
  'void-deep': [20, 19, 14],
  deep: [26, 24, 18],
  surface: [33, 31, 22],
  border: [58, 52, 37],
  hero: [42, 38, 23],
  emerald: [122, 158, 110],
  'emerald-dim': [90, 122, 80],
  gold: [201, 169, 110],
  'gold-dim': [160, 136, 80],
  warm: [196, 130, 90],
  'warm-dim': [160, 104, 64],
  info: [90, 158, 142],
  'info-dim': [72, 128, 120],
  pink: [212, 131, 158],
  'pink-dim': [176, 106, 132],
  ink: [255, 255, 255],
  shade: [0, 0, 0],
  'danger-soft': [252, 165, 165],
  danger: [248, 113, 113],
  'data-good': [122, 158, 110],
  'data-mid': [201, 169, 110],
  'data-low': [196, 130, 90],
  'data-none': [248, 113, 113],
  'reader-from': [13, 27, 23],
  'reader-via': [10, 20, 18],
  'reader-to': [13, 20, 32],
  'reader-text': [232, 226, 208],
  'reader-soft': [214, 208, 191],
  'reader-note': [216, 208, 184],
  'on-color': [255, 255, 255],
  'hero-ink': [255, 255, 255],
  'hero-gold': [226, 190, 120],
  'hero-danger': [250, 150, 140],
} as const satisfies Record<string, Rgb>;

export type ColorName = keyof typeof dark;

const light: Record<ColorName, Rgb> = {
  void: [237, 239, 226],
  'void-deep': [243, 244, 233],
  deep: [248, 248, 239],
  surface: [226, 231, 211],
  border: [198, 206, 176],
  hero: [217, 227, 198],
  emerald: [54, 81, 46],
  'emerald-dim': [58, 86, 50],
  gold: [95, 74, 24],
  'gold-dim': [84, 65, 20],
  warm: [119, 61, 31],
  'warm-dim': [104, 52, 26],
  info: [40, 91, 81],
  'info-dim': [34, 80, 71],
  pink: [132, 57, 90],
  'pink-dim': [116, 48, 78],
  ink: [31, 36, 24],
  shade: [120, 135, 100],
  'danger-soft': [155, 28, 28],
  danger: [180, 35, 24],
  'data-good': [74, 138, 62],
  'data-mid': [212, 158, 38],
  'data-low': [206, 108, 50],
  'data-none': [200, 56, 44],
  'reader-from': [250, 250, 242],
  'reader-via': [246, 247, 236],
  'reader-to': [238, 242, 228],
  'reader-text': [31, 36, 24],
  'reader-soft': [60, 66, 50],
  'reader-note': [60, 66, 50],
  'on-color': [255, 255, 255],
  'hero-ink': [31, 36, 24],
  'hero-gold': [122, 88, 12],
  'hero-danger': [168, 30, 24],
};

// Night (app-only): the dark-first theme. Near-black midnight with a blue undertone (OLED friendly),
// a deep teal hero and luminous mint and gold accents. Text on the hero is the page ink.
const night: Record<ColorName, Rgb> = {
  void: [4, 7, 12],
  'void-deep': [8, 12, 20],
  deep: [13, 19, 31],
  surface: [21, 30, 47],
  border: [36, 50, 74],
  hero: [11, 40, 46],
  emerald: [98, 218, 170],
  'emerald-dim': [30, 120, 92],
  gold: [242, 205, 126],
  'gold-dim': [192, 158, 88],
  warm: [244, 156, 110],
  'warm-dim': [196, 124, 84],
  info: [116, 194, 234],
  'info-dim': [86, 154, 192],
  pink: [238, 150, 188],
  'pink-dim': [196, 120, 154],
  ink: [233, 240, 248],
  shade: [0, 0, 0],
  'danger-soft': [252, 176, 176],
  danger: [250, 122, 122],
  'data-good': [98, 218, 170],
  'data-mid': [242, 205, 126],
  'data-low': [244, 156, 110],
  'data-none': [250, 122, 122],
  'reader-from': [6, 16, 22],
  'reader-via': [5, 12, 18],
  'reader-to': [8, 12, 26],
  'reader-text': [226, 234, 242],
  'reader-soft': [200, 210, 222],
  'reader-note': [204, 214, 226],
  'on-color': [255, 255, 255],
  'hero-ink': [233, 240, 248],
  'hero-gold': [242, 205, 126],
  'hero-danger': [250, 140, 130],
};

// Sand (app-only): the warm theme with little white. Page and cards are sand and parchment tones,
// the hero is a deep clay with cream text. Pure white never appears except `on-color`.
const sand: Record<ColorName, Rgb> = {
  void: [232, 211, 176],
  'void-deep': [226, 203, 165],
  deep: [243, 227, 197],
  surface: [224, 202, 166],
  border: [188, 158, 114],
  hero: [104, 54, 32],
  emerald: [48, 80, 40],
  'emerald-dim': [52, 86, 44],
  gold: [110, 70, 8],
  'gold-dim': [96, 60, 6],
  warm: [138, 58, 24],
  'warm-dim': [120, 50, 20],
  info: [24, 84, 74],
  'info-dim': [20, 72, 64],
  pink: [128, 46, 80],
  'pink-dim': [112, 40, 70],
  ink: [34, 20, 10],
  shade: [90, 64, 36],
  'danger-soft': [150, 26, 22],
  danger: [168, 30, 24],
  'data-good': [70, 124, 56],
  'data-mid': [196, 140, 30],
  'data-low': [196, 98, 44],
  'data-none': [190, 50, 40],
  'reader-from': [236, 216, 182],
  'reader-via': [230, 208, 172],
  'reader-to': [222, 198, 160],
  'reader-text': [34, 20, 10],
  'reader-soft': [86, 62, 40],
  'reader-note': [86, 62, 40],
  'on-color': [255, 255, 255],
  'hero-ink': [255, 241, 216],
  'hero-gold': [250, 214, 128],
  'hero-danger': [255, 165, 150],
};

export const tokens: Record<ThemeName, Record<ColorName, Rgb>> = { dark, light, night, sand };

/** True for themes with a light page (status bar icons go dark). */
export const isLightTheme = (theme: ThemeName): boolean => theme === 'light' || theme === 'sand';

/** `rgb(...)` string for places that need a plain colour (status bar, native views). */
export function color(theme: ThemeName, name: ColorName): string {
  const [r, g, b] = tokens[theme][name];
  return `rgb(${r}, ${g}, ${b})`;
}

/** `#rrggbb` for native config that cannot take `rgb()` (splash screen, app.config.ts). */
export function hex(theme: ThemeName, name: ColorName): string {
  return `#${tokens[theme][name].map((c) => c.toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

/** CSS variables for NativeWind's `vars()`: `--c-void: '14 13 10'` and so on. */
export function tokenVars(theme: ThemeName): Record<string, string> {
  return Object.fromEntries(
    Object.entries(tokens[theme]).map(([name, [r, g, b]]) => [`--c-${name}`, `${r} ${g} ${b}`])
  );
}
