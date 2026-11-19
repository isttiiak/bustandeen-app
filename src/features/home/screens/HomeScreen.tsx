import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { setLang, useLang, type Lang } from '@/features/settings/langStore';
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
import { FastingSheet, TimesSheet, TrackerSheet, ZikrSheet } from '../components/Sheets';
import { SkyHero } from '../components/SkyHero';
import { VerseCard } from '../components/VerseCard';
import { copyFor, digits, fill } from '../copy';
import { heroInfo } from '../heroInfo';
import { useNow } from '../hooks';
import { applySim, setProto, useProto } from '../proto';
import { dayState, SAMPLE_DAY, type PrayerId } from '../schedule';
import { verseOfDay } from '../verses';

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

type SheetKey = 'times' | 'tracker' | 'zikr' | 'fasting' | null;

function HomeBody({ active }: { active: boolean }) {
  const lang = useLang();
  const c = copyFor(lang);
  const router = useRouter();
  const toast = useToast();
  const proto = useProto();
  const now = applySim(useNow(), proto.simMinutes, proto.simAt);

  const [done, setDone] = useState<Record<string, boolean>>(
    active ? { fajr: true, dhuhr: true } : {}
  );
  const [zikr, setZikr] = useState(active ? 33 : 0);
  const [sheet, setSheet] = useState<SheetKey>(null);

  const num = (n: number | string) => digits(n, lang);
  const info = useMemo(() => heroInfo(now, c, lang, proto.fasting), [now, c, lang, proto.fasting]);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const tracked = SAMPLE_DAY.filter((p) => p.tracked);
  const state = dayState(now);
  const window = state.kind === 'prayer' ? { start: state.start, end: state.end } : null;
  // The latest prayer whose time has started, so the timeline keeps a "you are here" through a
  // forbidden time or a gap (null before Fajr).
  const startedId = [...tracked].reverse().find((p) => p.minutes <= nowMinutes)?.id ?? null;
  const doneCount = tracked.filter((p) => done[p.id]).length;
  const names = {
    fajr: c.fajr,
    sunrise: c.sunrise,
    dhuhr: c.dhuhr,
    asr: c.asr,
    maghrib: c.maghrib,
    isha: c.isha,
  } satisfies Record<PrayerId, string>;

  const toggle = (id: PrayerId) => {
    const nowDone = !done[id];
    setDone((d) => ({ ...d, [id]: nowDone }));
    if (nowDone && tracked.filter((p) => p.id !== id).every((p) => done[p.id])) {
      toast.show(c.allDone, 'success');
    }
  };

  const locale = lang === 'bn' ? 'bn-BD' : 'en-US';
  const date = now.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' });
  const hijri = hijriText(now, lang) ?? c.hijriFallback;
  const open = (key: Exclude<SheetKey, null>) => () => setSheet(key);
  const lbl = (name: string) => fill(c.openCard, { name });

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
          <Chip label={c.location} />
        </View>
      </Block>

      <Block index={1}>
        <HeroFrame frame={proto.frame}>
          {proto.layout === 'a' ? (
            <ArchInfo info={info} c={c}>
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
              c={c}
              nowMinutes={nowMinutes}
              window={window}
              done={done}
              names={names}
              onToggle={toggle}
            />
          )}
        </HeroFrame>
      </Block>

      <Block index={2}>
        <VerseCard verse={verseOfDay(now)} c={c} lang={lang} />
      </Block>

      <Block index={3}>
        <View className="flex-row gap-3">
          <View className="flex-1">
            <QuickCard
              icon="clock"
              title={c.cardTimes}
              label={lbl(c.cardTimes)}
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
              title={c.cardTracker}
              label={lbl(c.cardTracker)}
              onPress={open('tracker')}
            >
              <TrackerValue
                done={doneCount}
                total={tracked.length}
                label={`${c.prayersToday}: ${doneCount}/${tracked.length}`}
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
              title={c.cardZikr}
              label={lbl(c.cardZikr)}
              calling={zikr === 0 && !active}
              onPress={open('zikr')}
            >
              <CounterValue
                count={zikr}
                streak={active ? 9 : 0}
                countLabel={c.todayWord}
                streakLabel={c.dayStreak}
                word={c.cardZikr}
                num={num}
              />
            </QuickCard>
          </View>
          <View className="flex-1">
            <QuickCard
              icon="book"
              title={c.cardQuran}
              label={lbl(c.cardQuran)}
              onPress={() => router.navigate('/quran')}
            >
              <CounterValue
                count={0}
                streak={active ? 4 : 0}
                countLabel={c.pagesToday}
                streakLabel={c.dayStreak}
                word={c.cardQuran}
                num={num}
              />
            </QuickCard>
          </View>
        </View>
      </Block>

      <Block index={5}>
        <QuickCard
          icon="moon"
          title={c.cardFasting}
          label={lbl(c.cardFasting)}
          onPress={open('fasting')}
        >
          <CounterValue
            count={active ? 6 : 0}
            streak={0}
            countLabel={c.daysThisMonth}
            streakLabel={c.dayStreak}
            word={c.cardFasting}
            num={num}
          />
        </QuickCard>
      </Block>

      <Text variant="caption" tone="faint" className="text-center">
        {c.sampleNote}
      </Text>

      <TimesSheet
        visible={sheet === 'times'}
        onClose={() => setSheet(null)}
        c={c}
        num={num}
        nextId={info.next.id}
      />
      <TrackerSheet
        visible={sheet === 'tracker'}
        onClose={() => setSheet(null)}
        c={c}
        num={num}
        done={done}
        onToggle={toggle}
        nextId={info.next.id}
      />
      <ZikrSheet
        visible={sheet === 'zikr'}
        onClose={() => setSheet(null)}
        c={c}
        num={num}
        count={zikr}
        setCount={setZikr}
      />
      <FastingSheet visible={sheet === 'fasting'} onClose={() => setSheet(null)} c={c} num={num} />
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
