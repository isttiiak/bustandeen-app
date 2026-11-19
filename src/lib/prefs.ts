import { kv } from './kv';

// Where the user's preferences live on the device (encrypted MMKV). Keys keep their web names so
// preference sync (P2-14) can use the same ones. `night` and `sand` are app-only theme modes that the
// website does not know, so they go under their own key and never into the web's `bustandeen_theme_mode`
// (decision O22).
export const PREF_KEYS = {
  themeMode: 'bustandeen_theme_mode',
  appThemeMode: 'bustandeen_app_theme_mode',
  lang: 'bustandeen_lang',
} as const;

/** The small part of the key-value store the preference code needs; a fake in unit tests. */
export interface PrefStore {
  getString: (key: string) => string | undefined;
  setString: (key: string, value: string) => void;
  remove: (key: string) => void;
}

/** The real store. Reads never throw: a storage problem must not stop the app from starting. */
export const prefStore: PrefStore = {
  getString: (key) => {
    try {
      return kv.getString(key);
    } catch {
      return undefined;
    }
  },
  setString: (key, value) => {
    try {
      kv.setString(key, value);
    } catch {
      // Saving a preference is best effort: the choice still applies for this run.
    }
  },
  remove: (key) => {
    try {
      kv.remove(key);
    } catch {
      // see above
    }
  },
};
