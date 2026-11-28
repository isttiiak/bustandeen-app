// The one place the Today's tab gets dates and events from. Screens know nothing about Hijri, Bengali,
// moon-sighting or day-boundary rules.
//
// TODO(core): back this with `@bustandeen/core` (EV-07): the place's calendar day, the Islamic day that
// changes at Maghrib, the country's moon-sighting records and the user's own adjustment. Until then the
// answers are SAMPLE DAYS that the website's own code produced on plain Umm al-Qura, and the day is the
// phone's calendar date, which is what the website uses without a saved place.

import { addDays, zikrToday } from '@/features/zikr/logic/day';

import {
  HOLIDAYS,
  NATIONAL_DAYS,
  type Holiday,
  type NationalDay,
  type SpecialDayId,
} from '../content/data';
import { SAMPLE_FROM, SAMPLE_ROWS } from '../content/sampleDays';

export { addDays };

export interface Ymd {
  year: number;
  month: number;
  day: number;
}

export type DayEvent =
  | { type: 'islamic'; id: SpecialDayId; night: boolean; listed: boolean }
  | { type: 'holiday'; holiday: Holiday }
  | { type: 'national'; day: NationalDay };

export interface EventDay {
  /** YYYY-MM-DD */
  ymd: string;
  hijri: Ymd;
  bengali: Ymd;
  islamic: readonly Extract<DayEvent, { type: 'islamic' }>[];
}

export interface UpcomingEvent {
  ymd: string;
  hijri: Ymd;
  daysAway: number;
  event: DayEvent;
}

/** The phone's calendar date. */
export const civilToday = (now: Date): string => zikrToday(now);

const utc = (ymd: string): number => Date.parse(`${ymd}T12:00:00Z`);
export const daysBetween = (from: string, to: string): number =>
  Math.round((utc(to) - utc(from)) / 86_400_000);

function parseYmd(s: string): Ymd {
  const [year = 0, month = 0, day = 0] = s.split('-').map(Number);
  return { year, month, day };
}

/** The dates and special days of a civil day; null outside the sample window. */
export function dayOf(ymd: string): EventDay | null {
  const row = SAMPLE_ROWS[daysBetween(SAMPLE_FROM, ymd)];
  if (row === undefined) return null;
  const [hijri = '', bengali = '', ids = ''] = row.split('|');
  return {
    ymd,
    hijri: parseYmd(hijri),
    bengali: parseYmd(bengali),
    islamic: ids
      ? ids.split(',').map((token) => ({
          type: 'islamic' as const,
          id: token.replace(/[~*]/g, '') as SpecialDayId,
          night: token.includes('~'),
          listed: token.includes('*'),
        }))
      : [],
  };
}

/** A day's events in the website's order: Islamic days, government holidays, national days. */
export function eventsOf(day: EventDay, country: string | null): DayEvent[] {
  const holidays = country ? (HOLIDAYS[country] ?? []) : [];
  const national = country ? (NATIONAL_DAYS[country] ?? []) : [];
  return [
    ...day.islamic,
    ...holidays
      .filter((h) => h.date === day.ymd)
      .map((holiday): DayEvent => ({ type: 'holiday', holiday })),
    ...national
      .filter((n) => n.monthDay === day.ymd.slice(5))
      .map((n): DayEvent => ({ type: 'national', day: n })),
  ];
}

const WINDOW = 30;

/**
 * What is coming in the next 30 days, without weekly and monthly days (the website's list). Islamic days
 * come first, then the rest, each by date; when no Islamic day falls in the window the next one is added
 * however far it is (owner, 2026-11-29).
 */
export function upcoming(from: string, country: string | null): UpcomingEvent[] {
  const islamic: UpcomingEvent[] = [];
  const others: UpcomingEvent[] = [];
  for (let n = 1; n <= WINDOW || islamic.length === 0; n++) {
    const day = dayOf(addDays(from, n));
    if (!day) break;
    for (const event of eventsOf(day, country)) {
      const row = { ymd: day.ymd, hijri: day.hijri, daysAway: n, event };
      if (event.type === 'islamic') {
        if (event.listed && (n <= WINDOW || islamic.length === 0)) islamic.push(row);
      } else if (n <= WINDOW) {
        others.push(row);
      }
    }
  }
  return [...islamic, ...others];
}

export interface HijriMonthView {
  /** Days in this month in the sample (29 or 30). */
  length: number;
  /** Days of the month that carry a monthly or yearly Islamic day. */
  marked: ReadonlySet<number>;
}

const WEEKLY: ReadonlySet<SpecialDayId> = new Set<SpecialDayId>(['friday', 'fast_mon_thu']);

/** The Hijri month `day` is in. */
export function hijriMonthOf(day: EventDay): HijriMonthView {
  const first = addDays(day.ymd, 1 - day.hijri.day);
  const marked = new Set<number>();
  let length = 0;
  for (let i = 0; i < 30; i++) {
    const d = dayOf(addDays(first, i));
    if (!d || d.hijri.month !== day.hijri.month || d.hijri.year !== day.hijri.year) break;
    length = d.hijri.day;
    if (d.islamic.some((e) => !WEEKLY.has(e.id))) marked.add(d.hijri.day);
  }
  return { length, marked };
}
