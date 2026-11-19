// Port of the web's `resolveTheme` (frontend/src/utils/theme.ts): a user-chosen MODE resolves to
// one of the two themes. Pure, so it is tested without a device.

import type { ThemeName } from './tokens';

// `night` and `sand` are app-only modes (decision O22). When preference sync lands (P2-14) they must
// not be written to the web's `bustandeen_theme_mode`, which only knows the first four.
export const themeModes = ['system', 'dark', 'light', 'daylight', 'night', 'sand'] as const;
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
    case 'night':
      return 'night';
    case 'sand':
      return 'sand';
    case 'system':
      return opts.systemScheme === 'light' ? 'light' : 'dark';
    case 'daylight':
      return isDaytime(opts.now ?? new Date(), opts.daylight ?? null) ? 'light' : 'dark';
    default:
      return 'dark';
  }
}

// ---- Saving the chosen mode ----------------------------------------------------------------------
// The web's four modes go under the web key; the app-only modes under their own key, so the web key
// never holds a value the website cannot read. The app key wins when both exist.

/** Modes the website understands. */
export const webThemeModes = ['system', 'dark', 'light', 'daylight'] as const;
/** Modes that exist only in the app. */
export const appThemeModes = ['night', 'sand'] as const;

export const DEFAULT_THEME_MODE: ThemeMode = 'night';

const isMode = (v: string | undefined, list: readonly string[]): v is ThemeMode =>
  v !== undefined && list.includes(v);

interface Store {
  getString: (key: string) => string | undefined;
  setString: (key: string, value: string) => void;
  remove: (key: string) => void;
}

export function loadThemeMode(store: Store, keys: { web: string; app: string }): ThemeMode {
  const app = store.getString(keys.app);
  if (isMode(app, appThemeModes)) return app;
  const web = store.getString(keys.web);
  if (isMode(web, webThemeModes)) return web;
  return DEFAULT_THEME_MODE;
}

export function saveThemeMode(
  store: Store,
  keys: { web: string; app: string },
  mode: ThemeMode
): void {
  if (isMode(mode, appThemeModes)) {
    store.setString(keys.app, mode);
    return;
  }
  store.setString(keys.web, mode);
  store.remove(keys.app);
}
