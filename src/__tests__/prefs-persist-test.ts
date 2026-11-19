import { PREF_KEYS } from '@/lib/prefs';
import { loadThemeMode, saveThemeMode, type ThemeMode } from '@/theme/resolve';

function fakeStore(initial: Record<string, string> = {}) {
  const data = { ...initial };
  return {
    data,
    getString: (k: string) => data[k],
    setString: (k: string, v: string) => {
      data[k] = v;
    },
    remove: (k: string) => {
      delete data[k];
    },
  };
}
const KEYS = { web: PREF_KEYS.themeMode, app: PREF_KEYS.appThemeMode };

describe('theme mode persistence', () => {
  it('defaults to Night when nothing is saved or the saved value is not a mode', () => {
    expect(loadThemeMode(fakeStore(), KEYS)).toBe('night');
    expect(loadThemeMode(fakeStore({ [KEYS.web]: 'neon' }), KEYS)).toBe('night');
    expect(loadThemeMode(fakeStore({ [KEYS.app]: 'dark' }), KEYS)).toBe('night'); // wrong key for dark
  });

  it('keeps every mode across a restart (save, then load from the same store)', () => {
    const modes: ThemeMode[] = ['system', 'dark', 'light', 'daylight', 'night', 'sand'];
    for (const m of modes) {
      const store = fakeStore();
      saveThemeMode(store, KEYS, m);
      expect(loadThemeMode(store, KEYS)).toBe(m);
    }
  });

  it('never writes an app-only mode under the web key', () => {
    const store = fakeStore();
    saveThemeMode(store, KEYS, 'sand');
    expect(store.data[KEYS.web]).toBeUndefined();
    expect(store.data[KEYS.app]).toBe('sand');
    saveThemeMode(store, KEYS, 'night');
    expect(store.data[KEYS.web]).toBeUndefined();
  });

  it('switching back to a web mode writes the web key and clears the app key', () => {
    const store = fakeStore();
    saveThemeMode(store, KEYS, 'sand');
    saveThemeMode(store, KEYS, 'light');
    expect(store.data[KEYS.web]).toBe('light');
    expect(store.data[KEYS.app]).toBeUndefined();
    expect(loadThemeMode(store, KEYS)).toBe('light');
  });

  it('reads a web-saved mode when the app has no key of its own (shared pref)', () => {
    expect(loadThemeMode(fakeStore({ [KEYS.web]: 'daylight' }), KEYS)).toBe('daylight');
  });
});

describe('the real stores write through to preferences', () => {
  it('setThemeMode and setLang save, and the web key never holds Sand', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- loaded here so the jest kv stand-in is the one used
    const { setThemeMode } = require('@/theme/ThemeProvider');
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- same reason
    const { setLang } = require('@/features/settings/langStore');
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- same reason
    const { prefStore } = require('@/lib/prefs');
    setThemeMode('sand');
    setLang('bn');
    expect(prefStore.getString(PREF_KEYS.appThemeMode)).toBe('sand');
    expect(prefStore.getString(PREF_KEYS.themeMode)).toBeUndefined();
    expect(prefStore.getString(PREF_KEYS.lang)).toBe('bn');
    setThemeMode('light');
    expect(prefStore.getString(PREF_KEYS.themeMode)).toBe('light');
    expect(prefStore.getString(PREF_KEYS.appThemeMode)).toBeUndefined();
  });
});
