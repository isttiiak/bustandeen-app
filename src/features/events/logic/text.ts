import type { TFunction } from 'i18next';

import type { Lang } from '@/features/settings/langStore';
import { digits } from '@/lib/format';

import {
  BENGALI_MONTHS,
  HIJRI_ERA,
  HIJRI_MONTHS,
  SPECIAL_DAY_NAMES,
  type SpecialDayName,
} from '../content/data';
import type { DayEvent, Ymd } from '../data/source';

// Words of the Today's tab. Dates come from the source; this only writes them out.

export type CalendarKind = 'greg' | 'hijri' | 'bn';

const localeOf = (lang: Lang) => (lang === 'bn' ? 'bn-BD' : 'en-GB');

/** A civil date in the app language. Noon on the phone's clock, so no time zone can move the day. */
export function civil(ymd: string, lang: Lang, options: Intl.DateTimeFormatOptions): string {
  const [y = 1970, m = 1, d = 1] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d, 12).toLocaleDateString(localeOf(lang), options);
}
export const civilLong = (ymd: string, lang: Lang) =>
  civil(ymd, lang, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
export const civilShort = (ymd: string, lang: Lang) =>
  civil(ymd, lang, { day: 'numeric', month: 'short' });

export const hijriMonth = (month: number, lang: Lang) => HIJRI_MONTHS[month - 1]?.[lang] ?? '';
export const hijriMonthYear = (h: Ymd, lang: Lang) =>
  `${hijriMonth(h.month, lang)} ${digits(h.year, lang)} ${HIJRI_ERA[lang]}`;
export const hijriDay = (h: Ymd, lang: Lang) =>
  `${digits(h.day, lang)} ${hijriMonth(h.month, lang)}`;

/** Always in Bangla, as on the website, so it never reads like the other two dates. */
export const bengaliMonthYear = (b: Ymd) =>
  `${BENGALI_MONTHS[b.month - 1] ?? ''} ${digits(b.year, 'bn')} বঙ্গাব্দ`;
export const bengaliDate = (b: Ymd) => `${digits(b.day, 'bn')} ${bengaliMonthYear(b)}`;

const special = (id: keyof typeof SPECIAL_DAY_NAMES): SpecialDayName => SPECIAL_DAY_NAMES[id];

export function eventName(e: DayEvent, lang: Lang): string {
  if (e.type === 'islamic') return special(e.id).name[lang];
  return (e.type === 'holiday' ? e.holiday : e.day)[lang];
}

/** The line under a name: what kind of day it is. */
export function eventDetail(e: DayEvent, t: TFunction, lang: Lang): string {
  if (e.type === 'islamic') return special(e.id).badge[lang];
  if (e.type === 'national') return t('calendar.kind.national');
  return [
    t('calendar.kind.holiday'),
    t(`calendar.holidayKind.${e.holiday.kind}`),
    ...(e.holiday.moon ? [t('calendar.moonDependent')] : []),
  ].join(' · ');
}

export function inDays(n: number, t: TFunction, lang: Lang): string {
  return n === 1 ? t('calendar.tomorrow') : t('calendar.inDays', { n: digits(n, lang) });
}

/**
 * English and Hijri for everyone (the website's default); the Bengali calendar too in Bangladesh or when
 * the app is in Bangla (owner, 2026-11-29). TODO(EV-03): the user's own choice, `bustandeen_calendar_layers`.
 */
export function defaultLayers(country: string | null, lang: Lang): CalendarKind[] {
  return country === 'BD' || lang === 'bn' ? ['greg', 'hijri', 'bn'] : ['greg', 'hijri'];
}
