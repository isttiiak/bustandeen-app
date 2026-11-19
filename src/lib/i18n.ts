import * as Localization from 'expo-localization';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import bn from '@/locales/bn/common.json';
import en from '@/locales/en/common.json';

import { PREF_KEYS, prefStore } from './prefs';

// i18next for the app (task P2-06). English and Bangla, resources bundled in the app, so it works
// offline and starts synchronously (no flash of the wrong language). Keys that exist on the website keep
// their website path (`prayerTimes.fajr`, `settings.language`); new app strings live under `app.*`, and
// prototype-only switch labels under `proto.*`. Arabic UI is out of scope (O10).

export type Lang = 'en' | 'bn';

/** Bangla if the phone is set to Bangla, else English. */
export function deviceLang(): Lang {
  try {
    return Localization.getLocales()[0]?.languageCode === 'bn' ? 'bn' : 'en';
  } catch {
    return 'en';
  }
}

/** The saved choice (`bustandeen_lang`, same key as the website), else the phone's language. */
export function initialLang(): Lang {
  const saved = prefStore.getString(PREF_KEYS.lang);
  return saved === 'bn' || saved === 'en' ? saved : deviceLang();
}

export const i18n = createInstance();

void i18n.use(initReactI18next).init({
  lng: initialLang(),
  fallbackLng: 'en',
  resources: { en: { common: en }, bn: { common: bn } },
  defaultNS: 'common',
  ns: ['common'],
  interpolation: { escapeValue: false },
  returnNull: false,
  initAsync: false,
  react: { useSuspense: false },
});

/** Switches the language now and remembers it. */
export function changeLang(next: Lang): void {
  if (i18n.language === next) return;
  void i18n.changeLanguage(next);
  prefStore.setString(PREF_KEYS.lang, next);
}
