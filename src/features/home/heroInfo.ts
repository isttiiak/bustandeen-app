import type { TFunction } from 'i18next';

import type { Lang } from '@/features/settings/langStore';
import { digits } from '@/lib/format';

import {
  dayState,
  fastingMark,
  formatClock,
  formatCountdown,
  nextPrayer,
  PRAYER_KEY,
  type PrayerId,
} from './schedule';

// Everything the Home hero shows, worked out once so layout A and B stay identical in content and the
// hurried user always gets the same answer: what is now, when it ends, what is next, iftar or suhoor.
export interface HeroInfo {
  /** `prayer`, `forbidden` (replaces the prayer), or `between` two prayers. */
  kind: 'prayer' | 'forbidden' | 'between';
  /** Small line above the title: "Current prayer", "Forbidden time"... */
  label: string;
  /** Prayer name, or the forbidden-time reason, or "Between prayers". */
  title: string;
  /** Start to end of the window ("11:52 - 15:08"). */
  window: string;
  countLabel: string;
  countdown: string;
  /** 0 to 1 through the window; null when there is no window to show. */
  progress: number | null;
  currentId: PrayerId | null;
  next: { id: PrayerId; name: string; time: string };
  /** Iftar or suhoor row, only on a fasting day and only until Maghrib. */
  fast: { label: string; time: string; left: string } | null;
  /** One sentence for screen readers. */
  spoken: string;
}

const hm = (ms: number) => formatCountdown(ms).slice(0, 5);

export function heroInfo(now: Date, t: TFunction, lang: Lang, fasting: boolean): HeroInfo {
  const n = (v: string | number) => digits(v, lang);
  const clock = (m: number) => n(formatClock(m));
  const state = dayState(now);
  const nxt = nextPrayer(now);
  const next = {
    id: nxt.prayer.id,
    name: t(PRAYER_KEY[nxt.prayer.id]),
    time: clock(nxt.prayer.minutes),
  };

  let kind: HeroInfo['kind'] = 'between';
  let label: string = t('app.betweenPrayers');
  let title: string = t('app.betweenPrayers');
  let window = `${t('home.next')}: ${next.name} ${next.time}`;
  let countLabel: string = t('app.startsIn');
  let progress: number | null = null;
  let currentId: PrayerId | null = null;
  let msLeft = state.msLeft;

  if (state.kind === 'prayer') {
    kind = 'prayer';
    label = t('app.currentPrayer');
    title = t(PRAYER_KEY[state.id]);
    window = `${clock(state.start)} - ${clock(state.end)}`;
    countLabel = t('prayerTimes.endsIn');
    progress = state.elapsed;
    currentId = state.id;
  } else if (state.kind === 'forbidden') {
    kind = 'forbidden';
    label = t('app.forbiddenTime');
    title = {
      sunrise: t('salatNames.sunrise'),
      zenith: t('app.forbiddenZenith'),
      sunset: t('app.forbiddenSunset'),
    }[state.reason];
    window = `${clock(state.start)} - ${clock(state.end)}`;
    countLabel = t('prayerTimes.endsIn');
    progress = null;
  }
  if (state.kind === 'between') msLeft = nxt.msLeft;

  const mark = fasting ? fastingMark(now) : null;
  const fast = mark
    ? {
        label: mark.kind === 'suhoor' ? t('app.suhoorEnds') : t('app.iftar'),
        time: clock(mark.at),
        left: n(hm(mark.msLeft)),
      }
    : null;

  const countdown = n(formatCountdown(msLeft));
  const spoken = [
    `${label}: ${title}`,
    kind === 'between' ? '' : window,
    `${countLabel} ${countdown}`,
    `${t('home.next')}: ${next.name} ${next.time}`,
    fast ? `${fast.label} ${fast.time}` : '',
  ]
    .filter(Boolean)
    .join('. ');

  return {
    kind,
    label,
    title,
    window,
    countLabel,
    countdown,
    progress,
    currentId,
    next,
    fast,
    spoken,
  };
}
