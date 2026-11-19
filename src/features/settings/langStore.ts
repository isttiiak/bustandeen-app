import { useSyncExternalStore } from 'react';

// Language switch (task P2-05). Saved in the encrypted preferences under the web key `bustandeen_lang`
// and read synchronously on start. P2-06 replaces this with i18next on the same key.
import { PREF_KEYS, prefStore } from '@/lib/prefs';

export type Lang = 'en' | 'bn';

export function loadLang(store: { getString: (key: string) => string | undefined }): Lang {
  const v = store.getString(PREF_KEYS.lang);
  return v === 'bn' ? 'bn' : 'en';
}

let lang: Lang = loadLang(prefStore);
const listeners = new Set<() => void>();

export function setLang(next: Lang): void {
  if (next === lang) return;
  lang = next;
  prefStore.setString(PREF_KEYS.lang, next);
  listeners.forEach((l) => l());
}

export function useLang(): Lang {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => lang
  );
}
