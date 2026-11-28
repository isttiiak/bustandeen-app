import { useLocalSearchParams } from 'expo-router';
import { useEffect, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { useNow } from '@/features/home/hooks';
import { setLang, useLang } from '@/features/settings/langStore';
import { setThemeMode } from '@/theme/ThemeProvider';
import { themeModes, type ThemeMode } from '@/theme/resolve';
import { Button, IconButton } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Icon } from '@/ui/Icon';
import { SectionTitle } from '@/ui/Layout';
import { useEntering, useReduceMotion } from '@/ui/motion';
import { useToast } from '@/ui/Overlays';
import { Screen } from '@/ui/Screen';
import { Text } from '@/ui/Text';

import { TodayRows, UpcomingRows } from '../components/EventRows';
import { MonthArch } from '../components/MonthArch';
import { YearLines, type YearLine } from '../components/YearLines';
import { HIJRI_MONTHS_AR } from '../content/data';
import { addDays, civilToday, dayOf, eventsOf, hijriMonthOf, upcoming } from '../data/source';
import {
  bengaliDate,
  bengaliMonthYear,
  civil,
  civilLong,
  defaultLayers,
  hijriDay,
  hijriMonthYear,
} from '../logic/text';
import { digits } from '@/lib/format';

// "Today's" (task EV-01, prototype on sample days): what is special today, what is coming, and where today
// is in the year. The month, special-day and settings pages come next (EV-02 to EV-04).

const SOON = 3;
/** No bottom edge: the tab bar below already keeps clear of the system bar. */
const EDGES = ['top', 'left', 'right'] as const;
/** TODO(core): the user's country (profile, saved place, phone zone). Home's sample place is in Dhaka. */
const SAMPLE_COUNTRY = 'BD';

function Block({ index, children }: { index: number; children: ReactNode }) {
  const entering = useEntering(index);
  // Reduced motion: the block is simply there.
  const reduce = useReduceMotion();
  return (
    <Animated.View entering={reduce ? undefined : entering} className="gap-3">
      {children}
    </Animated.View>
  );
}

/** Dev only: `bustandeen://events?d=2026-12-04&country=none&theme=sand&lang=bn` opens any sample day. */
function useReviewLink(): { day: string | null; country: string | null } {
  const p = useLocalSearchParams<{
    d?: string;
    country?: string;
    theme?: string;
    lang?: string;
  }>();
  useEffect(() => {
    if (!__DEV__) return;
    if (p.theme && (themeModes as readonly string[]).includes(p.theme)) {
      setThemeMode(p.theme as ThemeMode);
    }
    if (p.lang === 'en' || p.lang === 'bn') setLang(p.lang);
  }, [p.theme, p.lang]);
  if (!__DEV__) return { day: null, country: SAMPLE_COUNTRY };
  return {
    day: p.d && /^\d{4}-\d{2}-\d{2}$/.test(p.d) ? p.d : null,
    country: p.country === 'none' ? null : (p.country ?? SAMPLE_COUNTRY),
  };
}

export function EventsScreen() {
  const { t } = useTranslation();
  const lang = useLang();
  const toast = useToast();
  const review = useReviewLink();
  const now = useNow(60_000);
  const ymd = review.day ?? civilToday(now);
  const { country } = review;

  // TODO(EV-02..EV-04): the month page, a special day's page, settings and the place picker.
  const soon = () => toast.show(t('app.soon'));

  const header = (
    <View className="flex-row items-center justify-between gap-3">
      <Text variant="h1" className="flex-1">
        {t('app.tabEvents')}
      </Text>
      <IconButton icon="calendar" label={t('app.events.calendarButton')} onPress={soon} />
      <IconButton icon="sliders" label={t('calendar.settings')} onPress={soon} />
    </View>
  );

  const day = dayOf(ymd);
  if (!day) {
    return (
      <Screen scroll edges={EDGES}>
        {header}
        <Text variant="title">{civilLong(ymd, lang)}</Text>
        <Text tone="muted">{t('app.events.outside')}</Text>
      </Screen>
    );
  }

  const layers = defaultLayers(country, lang);
  const events = eventsOf(day, country);
  const next = upcoming(ymd, country).slice(0, SOON);
  const tomorrow = dayOf(addDays(ymd, 1));
  const lines: Record<YearLine['kind'], YearLine> = {
    greg: {
      kind: 'greg',
      name: civil(ymd, lang, { month: 'long', year: 'numeric' }),
      month: Number(ymd.slice(5, 7)),
    },
    hijri: { kind: 'hijri', name: hijriMonthYear(day.hijri, lang), month: day.hijri.month },
    bn: { kind: 'bn', name: bengaliMonthYear(day.bengali), month: day.bengali.month },
  };

  return (
    <Screen scroll edges={EDGES}>
      {header}

      <Block index={0}>
        <MonthArch
          key={ymd}
          today={day.hijri.day}
          month={hijriMonthOf(day)}
          dayNumber={digits(day.hijri.day, lang)}
          monthYear={hijriMonthYear(day.hijri, lang)}
          monthArabic={HIJRI_MONTHS_AR[day.hijri.month - 1] ?? ''}
          civilDate={civilLong(ymd, lang)}
          bengali={layers.includes('bn') ? bengaliDate(day.bengali) : null}
          source={t('calendar.heroUq')}
          sample={t('app.events.sample')}
        />
      </Block>

      <Block index={1}>
        <SectionTitle>{t('calendar.today')}</SectionTitle>
        {events.length > 0 ? (
          <TodayRows ymd={ymd} events={events} onOpen={soon} />
        ) : (
          <Card className="flex-row items-center gap-3 p-4">
            <Icon name="moon" size={20} color="gold" />
            <Text tone="muted" className="flex-1">
              {t('app.events.none')}
            </Text>
          </Card>
        )}
      </Block>

      <Block index={2}>
        <SectionTitle>{t('calendar.comingUp')}</SectionTitle>
        {next.length > 0 ? (
          <UpcomingRows rows={next} onOpen={soon} />
        ) : (
          <Card className="p-4">
            <Text tone="muted">{t('calendar.nothingSoon')}</Text>
          </Card>
        )}
        <Button
          label={t('app.events.calendarButton')}
          variant="secondary"
          icon="calendar"
          fill
          onPress={soon}
        />
      </Block>

      {tomorrow ? (
        <Block index={3}>
          <Card className="flex-row items-start gap-3 p-4">
            <Icon name="location" size={20} color="gold" />
            <View className="flex-1 gap-2">
              <View>
                <Text variant="small" weight="semibold">
                  {`${t('calendar.changesLabel')}: ${hijriDay(tomorrow.hijri, lang)}`}
                </Text>
                <Text variant="small" tone="muted">
                  {t('calendar.changesNoPlace')}
                </Text>
              </View>
              <Button label={t('app.events.choosePlace')} variant="secondary" fill onPress={soon} />
            </View>
          </Card>
        </Block>
      ) : null}

      <Block index={4}>
        <SectionTitle>{t('app.events.year')}</SectionTitle>
        <YearLines lines={layers.map((k) => lines[k])} />
        <Text variant="caption" tone="muted">
          {t('calendar.moonNote')}
        </Text>
      </Block>
    </Screen>
  );
}
