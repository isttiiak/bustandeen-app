// Colour names map to CSS variables that ThemeProvider sets from src/theme/tokens.ts (the
// source of truth, equal to the web's --c-* values). No colour value lives in this file.
const channel = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;
const names = [
  'void',
  'void-deep',
  'deep',
  'surface',
  'border',
  'hero',
  'emerald',
  'emerald-dim',
  'gold',
  'gold-dim',
  'warm',
  'warm-dim',
  'info',
  'info-dim',
  'pink',
  'pink-dim',
  'ink',
  'shade',
  'danger-soft',
  'danger',
  'data-good',
  'data-mid',
  'data-low',
  'data-none',
  'reader-from',
  'reader-via',
  'reader-to',
  'reader-text',
  'reader-soft',
  'reader-note',
];

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: Object.fromEntries(names.map((n) => [n, channel(n)])),
      fontFamily: {
        display: ['El Messiri'],
        body: ['Plus Jakarta Sans'],
        bangla: ['Hind Siliguri'],
      },
      borderRadius: { card: '20px', control: '12px' },
    },
  },
};
