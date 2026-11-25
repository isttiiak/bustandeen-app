import {
  CORE_ZIKR,
  DEFAULT_MEANINGS,
  PREDEFINED_TYPES,
  ZIKR_DISPLAY_BN,
  ZIKR_LIBRARY,
  type LibraryItem,
} from './data';

export * from './data';

// How the counter shows a zikr, in the web's order (`pages/ZikrCounter.tsx`): the built-in meaning
// first, then the library's compact form. Custom zikr (added by the user) come with sync later.

export const DEFAULT_ZIKR = PREDEFINED_TYPES[0]!;

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

const LIBRARY_ITEMS: readonly LibraryItem[] = ZIKR_LIBRARY.flatMap((c) => c.items);

export function findLibraryItem(name: string): LibraryItem | undefined {
  return LIBRARY_ITEMS.find((i) => same(i.name, name));
}

export const isPredefined = (name: string) => PREDEFINED_TYPES.some((p) => same(p, name));
export const isCore = (name: string) => CORE_ZIKR.some((c) => same(c, name));
/** A zikr the app can show: built in or in the library. */
export const isKnownZikr = (name: string) => isPredefined(name) || !!findLibraryItem(name);

/** The name to show: the web's Bangla display name in Bangla, else the server name. */
export function zikrName(type: string, lang: string): string {
  return lang === 'bn' ? (ZIKR_DISPLAY_BN[type] ?? type) : type;
}

export interface ZikrDisplay {
  arabic: string;
  transliteration: string;
  meaning: string;
}

/** What the counter card shows for `type`. `t` resolves the built-in meanings' i18n keys. */
export function zikrDisplay(
  type: string,
  lang: string,
  t: (key: string) => string
): ZikrDisplay | null {
  const builtIn = DEFAULT_MEANINGS[type];
  if (builtIn) {
    return {
      arabic: builtIn.arabic,
      transliteration: builtIn.transliteration,
      meaning: t(builtIn.meaningKey),
    };
  }
  const item = findLibraryItem(type);
  if (!item) return null;
  return {
    arabic: item.shortArabic ?? item.arabic,
    transliteration: item.transliteration ?? '',
    meaning: lang === 'bn' && item.meaningBn ? item.meaningBn : (item.shortMeaning ?? item.meaning),
  };
}

/** The library item's meaning in the language (the web shows `meaningBn` in Bangla). */
export function libraryMeaning(item: LibraryItem, lang: string): string {
  return lang === 'bn' && item.meaningBn ? item.meaningBn : (item.shortMeaning ?? item.meaning);
}

export { same as sameZikrName };
