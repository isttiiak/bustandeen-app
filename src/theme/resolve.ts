// Port of the web's `resolveTheme` (frontend/src/utils/theme.ts): a user-chosen MODE resolves to
// one of the two themes. Pure, so it is tested without a device.

import type { ThemeName } from './tokens';

// `warm` and `mixed` are app-only modes (decision O22). When preference sync lands (P2-14) they must
// not be written to the web's `bustandeen_theme_mode`, which only knows the first four.
export const themeModes = ['system', 'dark', 'light', 'daylight', 'warm', 'mixed'] as const;
export type ThemeMode = (typeof themeModes)[number];

/** Web preference key; stored and synced under the same name once storage exists (P2-07, P2-14). */
export const THEME_MODE_KEY = 'bustandeen_theme_mode';

export interface DaylightWindow {
  start: Date;
  end: Date;
}

/** Between sunrise and Maghrib when known (from core prayer times, P3), else 06:00 to 18:00. */
export function isDaytime(now: Date, window: DaylightWindow | null): boolean {
  if (window) return now >= window.start && now < window.end;
  const h = now.getHours();
  return h >= 6 && h < 18;
}

export function resolveTheme(
  mode: ThemeMode,
  opts: {
    now?: Date;
    systemScheme?: 'light' | 'dark' | null;
    daylight?: DaylightWindow | null;
  } = {}
): ThemeName {
  switch (mode) {
    case 'light':
      return 'light';
    case 'warm':
      return 'warm';
    case 'mixed':
      return 'mixed';
    case 'system':
      return opts.systemScheme === 'light' ? 'light' : 'dark';
    case 'daylight':
      return isDaytime(opts.now ?? new Date(), opts.daylight ?? null) ? 'light' : 'dark';
    default:
      return 'dark';
  }
}
