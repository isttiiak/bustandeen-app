import { useSyncExternalStore } from 'react';

// Prototype language switch (task P2-05). P2-06 replaces this with i18next and the web pref key
// `bustandeen_lang`. In memory only.
export type Lang = 'en' | 'bn';

let lang: Lang = 'en';
const listeners = new Set<() => void>();

export function setLang(next: Lang): void {
  if (next === lang) return;
  lang = next;
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
