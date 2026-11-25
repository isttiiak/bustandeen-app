import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { setLang, useLang, type Lang } from '@/features/settings/langStore';
import { useZikr, zikrStore } from '@/features/zikr/store';
import { setThemeMode } from '@/theme/ThemeProvider';
import { themeModes, type ThemeMode } from '@/theme/resolve';
import { Chip } from '@/ui/Inputs';
import { useEntering } from '@/ui/motion';
import { useToast } from '@/ui/Overlays';
import { Screen } from '@/ui/Screen';
import { Text } from '@/ui/Text';

import { HeroFrame } from '../components/HeroFrame';
import { ArchInfo } from '../components/HeroParts';
import { PrayerTimeline } from '../components/PrayerTimeline';
import { CounterValue, QuickCard, TrackerValue } from '../components/QuickCards';
import { FastingSheet, TimesSheet, TrackerSheet } from '../components/Sheets';
import { SkyHero } from '../components/SkyHero';
import { VerseCard } from '../components/VerseCard';
import { heroInfo } from '../heroInfo';
import { useNow } from '../hooks';
import { applySim, setProto, useProto } from '../proto';
import { dayState, SAMPLE_DAY, type PrayerId } from '../schedule';
import { verseOfDay } from '../verses';
import { useTranslation } from 'react-i18next';
import { digits } from '@/lib/format';

function Block({ index, children }: { index: number; children: ReactNode }) {
  return <Animated.View entering={useEntering(index)}>{children}</Animated.View>;
}

/** Hijri date from the platform calendar; null when the runtime has no Islamic calendar (then the
 *  prototype shows a labelled placeholder). Real Hijri comes from core in Phase 3. */
function hijriText(d: Date, lang: Lang): string | null {
  try {
    const s = new Intl.DateTimeFormat(`${lang === 'bn' ? 'bn-BD' : 'en'}-u-ca-islamic-umalqura`, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
      .format(d)
      .replace(/\s*যুগ$/, '');
    return s.includes(String(d.getFullYear())) ? null : s;
  } catch {
    return null;
  }
}

type SheetKey = 'times' | 'tracker' | 'fasting' | null;

function HomeBody({ active }: { active: boolean }) {
  const lang = useLang();
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  const proto = useProto();
  const now = applySim(useNow(), proto.simMinutes, proto.simAt);

  const [done, setDone] = useState<Record<string, boolean>>(
    active ? { fajr: true, dhuhr: true } : {}
  );
  // Real zikr data (local, task P2-zikr-counter); the other cards are still samples.
  const zikr = useZikr();
  useFocusEffect(
    useCallback(() => {
      zikrStore().refreshDay();
    }, [])
  );
  const [sheet, setSheet] = useState<SheetKey>(null);

  const num = (n: number | string) => digits(n, lang);
  const info = useMemo(() => heroInfo(now, t, lang, proto.fasting), [now, t, lang, proto.fasting]);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const tracked = SAMPLE_DAY.filter((p) => p.tracked);
  const state = dayState(now);
  const window = state.kind === 'prayer' ? { start: state.start, end: state.end } : null;
  // The latest prayer whose time has started, so the timeline keeps a "you are here" through a
  // forbidden time or a gap (null before Fajr).
  const startedId = [...tracked].reverse().find((p) => p.minutes <= nowMinutes)?.id ?? null;
  const doneCount = tracked.filter((p) => done[p.id]).length;
  const names = {
    fajr: t('prayerTimes.fajr'),
    sunrise: t('salatNames.sunrise'),
    dhuhr: t('prayerTimes.dhuhr'),
    asr: t('prayerTimes.asr'),
    maghrib: t('prayerTimes.maghrib'),
    isha: t('prayerTimes.isha'),
  } satisfies Record<PrayerId, string>;

  const toggle = (id: PrayerId) => {
    const nowDone = !done[id];
    setDone((d) => ({ ...d, [id]: nowDone }));
    if (nowDone && tracked.filter((p) => p.id !== id).every((p) => done[p.id])) {
      toast.show(t('app.allDone'), 'success');
    }
  };

  const locale = lang === 'bn' ? 'bn-BD' : 'en-US';
  const date = now.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' });
  const hijri = hijriText(now, lang) ?? t('app.hijriFallback');
  const open = (key: Exclude<SheetKey, null>) => () => setSheet(key);
  const lbl = (name: string) => t('app.openCard', { name });

  return (
    <Screen scroll>
      <Block index={0}>
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text variant="title" display weight="bold">
              {date}
            </Text>
            <Text variant="small" tone="gold" weight="medium">
              {hijri}
            </Text>
          </View>
          <Chip label={t('app.location')} />
        </View>
      </Block>

      <Block index={1}>
        <HeroFrame frame={proto.frame}>
          {proto.layout === 'a' ? (
            <ArchInfo info={info}>
              <PrayerTimeline
                nowMinutes={nowMinutes}
                currentId={startedId}
                done={done}
                names={names}
                onToggle={toggle}
              />
            </ArchInfo>
          ) : (
            <SkyHero
              info={info}

              nowMinutes={nowMinutes}
              window={window}
              done={done}
              names={names}
              onToggle={toggle}
              row={
                proto.prayerRow ? (
                  <PrayerTimeline
                    nowMinutes={nowMinutes}
                    currentId={startedId}
                    done={done}
                    names={names}
                    onToggle={toggle}
                  />
                ) : undefined
              }
            />
          )}
        </HeroFrame>
      </Block>

      <Block index={2}>
        <VerseCard verse={verseOfDay(now)} lang={lang} />
      </Block>

      <Block index={3}>
        <View className="flex-row gap-3">
          <View className="flex-1">
            <QuickCard
              icon="clock"
              title={t('app.cardTimes')}
              label={lbl(t('app.cardTimes'))}
              onPress={open('times')}
            >
              <Text variant="small" tone="muted">
                {info.next.name}
              </Text>
              <Text variant="h2" tabular>
                {info.next.time}
              </Text>
            </QuickCard>
          </View>
          <View className="flex-1">
            <QuickCard
              icon="check"
              title={t('app.cardTracker')}
              label={lbl(t('app.cardTracker'))}
              onPress={open('tracker')}
            >
              <TrackerValue
                done={doneCount}
                total={tracked.length}
                label={`${t('app.prayersToday')}: ${doneCount}/${tracked.length}`}
                num={num}
              />
            </QuickCard>
          </View>
        </View>
      </Block>

      <Block index={4}>
        <View className="flex-row gap-3">
          <View className="flex-1">
            <QuickCard
              icon="counter"
              title={t('home.quick.zikr')}
              label={lbl(t('home.quick.zikr'))}
              calling={zikr.todayTotal === 0 && zikr.streak === 0}
              onPress={() => router.push('/zikr')}
            >
              <CounterValue
                count={zikr.todayTotal}
                streak={zikr.streak}
                countLabel={t('app.todayWord')}
                streakLabel={t('app.dayStreak')}
                word={t('home.quick.zikr')}
                num={num}
              />
            </QuickCard>
          </View>
          <View className="flex-1">
            <QuickCard
              icon="book"
              title={t('home.quick.quran')}
              label={lbl(t('home.quick.quran'))}
              onPress={() => router.navigate('/quran')}
            >
              <CounterValue
                count={0}
                streak={active ? 4 : 0}
                countLabel={t('app.pagesToday')}
                streakLabel={t('app.dayStreak')}
                word={t('home.quick.quran')}
                num={num}
              />
            </QuickCard>
          </View>
        </View>
      </Block>

      <Block index={5}>
        <QuickCard
          icon="moon"
          title={t('app.cardFasting')}
          label={lbl(t('app.cardFasting'))}
          onPress={open('fasting')}
        >
          <CounterValue
            count={active ? 6 : 0}
            streak={0}
            countLabel={t('app.daysThisMonth')}
            streakLabel={t('app.dayStreak')}
            word={t('app.cardFasting')}
            num={num}
          />
        </QuickCard>
      </Block>

      <Text variant="caption" tone="faint" className="text-center">
        {t('app.sampleNote')}
      </Text>

      <TimesSheet
        visible={sheet === 'times'}
        onClose={() => setSheet(null)}

        num={num}
        nextId={info.next.id}
      />
      <TrackerSheet
        visible={sheet === 'tracker'}
        onClose={() => setSheet(null)}

        num={num}
        done={done}
        onToggle={toggle}
        nextId={info.next.id}
      />
      <FastingSheet visible={sheet === 'fasting'} onClose={() => setSheet(null)} num={num} />
    </Screen>
  );
}

/** Dev only: `bustandeen://?theme=night&layout=b&t=780&fast=0&active=0&lang=bn` sets the prototype
 *  state from a link, so a phone or an emulator can open any state directly. */
function useProtoLink() {
  const p = useLocalSearchParams<{
    theme?: string;
    layout?: string;
    frame?: string;
    t?: string;
    fast?: string;
    active?: string;
    lang?: string;
  }>();
  useEffect(() => {
    if (!__DEV__) return;
    if (p.theme && (themeModes as readonly string[]).includes(p.theme)) {
      setThemeMode(p.theme as ThemeMode);
    }
    if (p.lang === 'en' || p.lang === 'bn') setLang(p.lang);
    setProto({
      ...(p.layout === 'a' || p.layout === 'b' ? { layout: p.layout } : null),
      ...(p.frame === 'arch' || p.frame === 'plain' ? { frame: p.frame } : null),
      ...(p.t ? { simMinutes: p.t === 'live' ? null : Number(p.t) } : null),
      ...(p.fast ? { fasting: p.fast === '1' } : null),
      ...(p.active ? { active: p.active === '1' } : null),
    });
  }, [p.theme, p.layout, p.frame, p.t, p.fast, p.active, p.lang]);
}

export function HomeScreen() {
  useProtoLink();
  const { active } = useProto();
  // A new key rebuilds the body with the other sample state (first-run empty or active).
  return <HomeBody key={String(active)} active={active} />;
}
