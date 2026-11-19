import type { Lang } from './i18n';

const BANGLA_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

/** Digits in the language's numerals (Bangla digits in Bangla, as the website does). */
export function digits(value: string | number, lang: Lang): string {
  const s = String(value);
  return lang === 'bn' ? s.replace(/\d/g, (d) => BANGLA_DIGITS[Number(d)]) : s;
}
