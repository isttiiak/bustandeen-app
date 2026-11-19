import { useSyncExternalStore } from 'react';

import { changeLang, i18n, type Lang } from '@/lib/i18n';

// The language switch. The language itself lives in i18next (src/lib/i18n.ts) and is saved under the
// web key `bustandeen_lang`; this keeps the small `useLang` / `setLang` API the screens already use.
export type { Lang };

export const setLang = changeLang;

export function useLang(): Lang {
  return useSyncExternalStore(
    (listener) => {
      i18n.on('languageChanged', listener);
      return () => i18n.off('languageChanged', listener);
    },
    () => (i18n.language === 'bn' ? 'bn' : 'en')
  );
}
