// SAMPLE prayer schedule for the P2-05 design prototype. These are NOT calculated times and carry no
// fiqh meaning: they only let the screen show a believable day. Real times come from
// `@bustandeen/core` (via `adhan`) on the device in Phase 3, from the last known place, with no
// network. Nothing here may be reused for real times.

export type PrayerId = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface SamplePrayer {
  id: PrayerId;
  /** Minutes after local midnight. */
  minutes: number;
  /** Sunrise is shown in the list but is not a prayer to log. */
  tracked: boolean;
}

export const SAMPLE_DAY: readonly SamplePrayer[] = [
  { id: 'fajr', minutes: 5 * 60 + 2, tracked: true },
  { id: 'sunrise', minutes: 6 * 60 + 20, tracked: false },
  { id: 'dhuhr', minutes: 11 * 60 + 52, tracked: true },
  { id: 'asr', minutes: 15 * 60 + 8, tracked: true },
  { id: 'maghrib', minutes: 17 * 60 + 26, tracked: true },
  { id: 'isha', minutes: 18 * 60 + 44, tracked: true },
];

export interface NextPrayer {
  prayer: SamplePrayer;
  /** Milliseconds until it starts (tomorrow's first prayer after Isha). */
  msLeft: number;
  /** 0 to 1: how far we are between the previous prayer and this one. */
  elapsed: number;
}

const minutesOfDay = (d: Date) =>
  d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60 + d.getMilliseconds() / 60000;

/** The next tracked prayer after `now`, wrapping to Fajr after Isha. */
export function nextPrayer(now: Date, day: readonly SamplePrayer[] = SAMPLE_DAY): NextPrayer {
  const tracked = day.filter((p) => p.tracked);
  const nowMin = minutesOfDay(now);
  const upcoming = tracked.find((p) => p.minutes > nowMin);
  const prayer = upcoming ?? tracked[0];
  // After the last prayer the next one is tomorrow's first, so its start is a day later.
  const startMin = upcoming ? upcoming.minutes : tracked[0].minutes + 24 * 60;
  const earlier = [...tracked].reverse().find((p) => p.minutes <= nowMin);
  // Before the first prayer the previous one is yesterday's last.
  const previousMin = earlier ? earlier.minutes : tracked[tracked.length - 1].minutes - 24 * 60;
  const span = startMin - previousMin;
  return {
    prayer,
    msLeft: Math.max(0, (startMin - nowMin) * 60000),
    elapsed: span > 0 ? Math.min(1, Math.max(0, (nowMin - previousMin) / span)) : 0,
  };
}

export function formatClock(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = Math.floor(minutes % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** HH:MM:SS for a countdown. */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}

// ---- Current state of the day (prototype, SAMPLE rules) ---------------------------------------
// Forbidden windows and prayer end times below are placeholders so the Home hero can show every
// state. Real windows come from `@bustandeen/core` in Phase 3 and need a rule source and a test
// (docs/08). Do not reuse these numbers.

export type ForbiddenReason = 'sunrise' | 'zenith' | 'sunset';

/** Sample windows in minutes after midnight: [start, end, reason]. */
export const SAMPLE_FORBIDDEN: readonly [number, number, ForbiddenReason][] = [
  [6 * 60 + 20, 6 * 60 + 35, 'sunrise'],
  [11 * 60 + 46, 11 * 60 + 52, 'zenith'],
  [17 * 60 + 11, 17 * 60 + 26, 'sunset'],
];

export type DayState =
  | {
      kind: 'prayer';
      id: PrayerId;
      start: number;
      end: number;
      /** ms until this prayer's time ends. */
      msLeft: number;
      /** 0 to 1 through the window. */
      elapsed: number;
    }
  | { kind: 'forbidden'; reason: ForbiddenReason; start: number; end: number; msLeft: number }
  | { kind: 'between'; end: number; msLeft: number };

const DAY = 24 * 60;

/** Where `now` sits: inside a forbidden window, inside a prayer's time, or between two prayers. */
export function dayState(now: Date, day: readonly SamplePrayer[] = SAMPLE_DAY): DayState {
  const m = minutesOfDay(now);
  const at = (id: PrayerId) => day.find((p) => p.id === id)!.minutes;
  for (const [start, end, reason] of SAMPLE_FORBIDDEN) {
    if (m >= start && m < end)
      return { kind: 'forbidden', reason, start, end, msLeft: (end - m) * 60000 };
  }
  // Prayer windows: each runs until the next prayer (Fajr until sunrise, Isha until the next Fajr).
  const windows: [PrayerId, number, number][] = [
    ['fajr', at('fajr'), at('sunrise')],
    ['dhuhr', at('dhuhr'), at('asr')],
    ['asr', at('asr'), at('maghrib')],
    ['maghrib', at('maghrib'), at('isha')],
    ['isha', at('isha'), at('fajr') + DAY],
    ['isha', at('isha') - DAY, at('fajr')],
  ];
  for (const [id, start, end] of windows) {
    if (m >= start && m < end) {
      return {
        kind: 'prayer',
        id,
        start,
        end,
        msLeft: (end - m) * 60000,
        elapsed: (m - start) / (end - start),
      };
    }
  }
  return { kind: 'between', end: at('dhuhr'), msLeft: (at('dhuhr') - m) * 60000 };
}

export interface FastingMark {
  kind: 'suhoor' | 'iftar';
  /** Minutes after midnight of the event (Fajr for suhoor, Maghrib for iftar). */
  at: number;
  msLeft: number;
}

/** Suhoor ends at Fajr, the fast ends at Maghrib; nothing after Maghrib. */
export function fastingMark(
  now: Date,
  day: readonly SamplePrayer[] = SAMPLE_DAY
): FastingMark | null {
  const m = minutesOfDay(now);
  const fajr = day.find((p) => p.id === 'fajr')!.minutes;
  const maghrib = day.find((p) => p.id === 'maghrib')!.minutes;
  if (m < fajr) return { kind: 'suhoor', at: fajr, msLeft: (fajr - m) * 60000 };
  if (m < maghrib) return { kind: 'iftar', at: maghrib, msLeft: (maghrib - m) * 60000 };
  return null;
}
