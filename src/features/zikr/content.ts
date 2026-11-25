// The zikr the counter starts with: the web's default list (web `frontend/src/store/useZikrStore.ts`).
// Religious text: copied VERBATIM from the web at main 5b55a3a5 (2026-11-25) by script, never typed by
// hand or written by a model (CLAUDE.md rule 3). Arabic and transliteration: web
// `frontend/src/components/zikr/zikrCounterData.ts` (DEFAULT_MEANINGS); Bangla names: web
// `frontend/src/utils/zikrLibrary.ts` (ZIKR_DISPLAY_BN). The meaning lives in the locale files under
// the same keys as the web (`zikr.meanings.*`). `type` is the server key (never translated).

export interface BuiltInZikr {
  type: string;
  arabic: string;
  transliteration: string;
  nameBn: string;
  meaningKey: string;
}

export const BUILT_IN_ZIKR: readonly BuiltInZikr[] = [
  {
    type: 'SubhanAllah',
    arabic: 'سُبْحَانَ اللَّهِ',
    transliteration: 'Subḥāna-llāh',
    nameBn: 'সুবহানাল্লাহ',
    meaningKey: 'zikr.meanings.subhanallah',
  },
  {
    type: 'Alhamdulillah',
    arabic: 'الْحَمْدُ لِلَّهِ',
    transliteration: 'Al-ḥamdu li-llāh',
    nameBn: 'আলহামদুলিল্লাহ',
    meaningKey: 'zikr.meanings.alhamdulillah',
  },
  {
    type: 'Allahu Akbar',
    arabic: 'اللَّهُ أَكْبَرُ',
    transliteration: 'Allāhu Akbar',
    nameBn: 'আল্লাহু আকবার',
    meaningKey: 'zikr.meanings.allahuAkbar',
  },
  {
    type: 'La ilaha illallah',
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ',
    transliteration: 'Lā ilāha illā-llāh',
    nameBn: 'লা ইলাহা ইল্লাল্লাহ',
    meaningKey: 'zikr.meanings.laIlahaIllallah',
  },
];

export const DEFAULT_ZIKR = BUILT_IN_ZIKR[0]!.type;

export function findZikr(type: string): BuiltInZikr | undefined {
  return BUILT_IN_ZIKR.find((z) => z.type === type);
}

/** The name to show: Bangla script in Bangla, else the web name (as the web's `zikrDisplayName`). */
export function zikrName(type: string, lang: string): string {
  return lang === 'bn' ? (findZikr(type)?.nameBn ?? type) : type;
}
