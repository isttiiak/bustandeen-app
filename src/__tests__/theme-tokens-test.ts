import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { resolveTheme } from '@/theme/resolve';
import { tokens, tokenVars, type ThemeName } from '@/theme/tokens';

// The web repo is the source of truth for the colours. Locally it sits next to this repo; where it
// is absent (CI today) the comparison is skipped, and P2-19 adds a checkout of it to CI.
const WEB_CSS =
  process.env.WEB_GLOBAL_CSS ??
  path.resolve(__dirname, '../../../bustandeen/frontend/src/styles/global.css');
const webAvailable = existsSync(WEB_CSS);

const THEME_SELECTOR: Record<ThemeName, string> = {
  dark: "[data-theme='bustandeen']",
  light: "[data-theme='bustandeen-light']",
};
// App token name -> web variable name (the app uses cleaner names, doc 06 section 1).
const WEB_NAME: Record<string, string> = { 'danger-soft': 'red-300', danger: 'red-400' };

function webChannels(css: string, theme: ThemeName): Record<string, string> {
  const start = css.indexOf(`${THEME_SELECTOR[theme]} {`);
  const body = css.slice(start, css.indexOf('}', start));
  const out: Record<string, string> = {};
  for (const m of body.matchAll(/--c-([a-z0-9-]+):\s*(\d+) (\d+) (\d+);/g)) {
    out[m[1]] = `${m[2]} ${m[3]} ${m[4]}`;
  }
  return out;
}

(webAvailable ? describe : describe.skip)('tokens equal the web --c-* values', () => {
  const css = webAvailable ? readFileSync(WEB_CSS, 'utf8') : '';
  for (const theme of ['dark', 'light'] as const) {
    it(`${theme}: every token matches`, () => {
      const web = webChannels(css, theme);
      expect(Object.keys(web).length).toBeGreaterThan(20);
      for (const [name, vars] of Object.entries(tokenVars(theme))) {
        const key = name.replace('--c-', '');
        expect({ name: key, value: vars }).toEqual({
          name: key,
          value: web[WEB_NAME[key] ?? key],
        });
      }
    });
  }
});

describe('tokens', () => {
  it('have the same names in both themes', () => {
    expect(Object.keys(tokens.light).sort()).toEqual(Object.keys(tokens.dark).sort());
  });
});

describe('resolveTheme', () => {
  const noon = new Date(2026, 10, 19, 12, 0);
  const night = new Date(2026, 10, 19, 23, 0);

  it('follows the system scheme, dark by default', () => {
    expect(resolveTheme('system', { systemScheme: 'light' })).toBe('light');
    expect(resolveTheme('system', { systemScheme: 'dark' })).toBe('dark');
    expect(resolveTheme('system', { systemScheme: null })).toBe('dark');
  });

  it('honours an explicit mode', () => {
    expect(resolveTheme('light', { systemScheme: 'dark' })).toBe('light');
    expect(resolveTheme('dark', { systemScheme: 'light' })).toBe('dark');
  });

  it('daylight is light between sunrise and Maghrib, else dark', () => {
    expect(resolveTheme('daylight', { now: noon })).toBe('light');
    expect(resolveTheme('daylight', { now: night })).toBe('dark');
    const window = { start: new Date(2026, 10, 19, 6, 30), end: new Date(2026, 10, 19, 17, 15) };
    expect(
      resolveTheme('daylight', { now: new Date(2026, 10, 19, 17, 30), daylight: window })
    ).toBe('dark');
    expect(resolveTheme('daylight', { now: new Date(2026, 10, 19, 6, 29), daylight: window })).toBe(
      'dark'
    );
  });
});
