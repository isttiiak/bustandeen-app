import { useRouter } from 'expo-router';
import { useMemo, useState, type ReactNode } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { useLang } from '@/features/settings/langStore';
import { ArchHero } from '@/ui/Art';
import { Card, Tile } from '@/ui/Card';
import { CompletionCheck, ProgressRing } from '@/ui/Feedback';
import { Icon, type IconName } from '@/ui/Icon';
import { Chip } from '@/ui/Inputs';
import { SectionTitle } from '@/ui/Layout';
import { useEntering } from '@/ui/motion';
import { useToast } from '@/ui/Overlays';
import { PressableScale } from '@/ui/PressableScale';
import { Screen } from '@/ui/Screen';
import { Text } from '@/ui/Text';

import { PrayerRow } from '../components/PrayerRow';
import { WeekBars } from '../components/WeekBars';
import { copyFor, digits, fill } from '../copy';
import { useNow } from '../hooks';
import { formatClock, formatCountdown, nextPrayer, SAMPLE_DAY, type PrayerId } from '../schedule';

// Sample insight numbers for the prototype (not real data): last seven days, Monday to Sunday.
const SAMPLE_WEEK = [5, 4, 5, 3, 5, 4, 2] as const;
const SAMPLE_STREAK = 12;

function Block({ index, children }: { index: number; children: ReactNode }) {
  return <Animated.View entering={useEntering(index)}>{children}</Animated.View>;
}

export function TodayScreen() {
  const lang = useLang();
  const c = copyFor(lang);
  const router = useRouter();
  const toast = useToast();
  const now = useNow();

  const [done, setDone] = useState<Record<string, boolean>>({ fajr: true, dhuhr: true });
  const next = useMemo(() => nextPrayer(now), [now]);

  const tracked = SAMPLE_DAY.filter((p) => p.tracked);
  const doneCount = tracked.filter((p) => done[p.id]).length;
  const allDone = doneCount === tracked.length;
  const num = (n: number | string) => digits(n, lang);
  const name = (id: PrayerId) => c[id];

  const toggle = (id: PrayerId) => {
    const nowDone = !done[id];
    setDone((d) => ({ ...d, [id]: nowDone }));
    if (nowDone && tracked.filter((p) => p.id !== id).every((p) => done[p.id])) {
      toast.show(c.allDone, 'success');
    }
  };

  const weekdayLabels = useMemo(() => {
    const base = new Date(2026, 0, 5); // a Monday
    return Array.from({ length: 7 }, (_, i) =>
      new Date(base.getFullYear(), base.getMonth(), base.getDate() + i).toLocaleDateString(
        lang === 'bn' ? 'bn-BD' : 'en-US',
        { weekday: 'narrow' }
      )
    );
  }, [lang]);
  const todayIndex = (now.getDay() + 6) % 7;
  const date = now.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const average = (SAMPLE_WEEK.reduce((a, b) => a + b, 0) / SAMPLE_WEEK.length).toFixed(1);

  const quick: { icon: IconName; label: string; onPress: () => void }[] = [
    { icon: 'counter', label: c.quickZikr, onPress: () => router.navigate('/zikr') },
    { icon: 'book', label: c.quickQuran, onPress: () => router.navigate('/quran') },
    { icon: 'location', label: c.quickQibla, onPress: () => toast.show(c.soon) },
  ];

  return (
    <Screen scroll>
      <Block index={0}>
        <View className="flex-row items-center justify-between gap-3">
          <Text variant="small" tone="muted" className="flex-1">
            {date}
          </Text>
          <Chip label={c.location} />
        </View>
      </Block>

      <Block index={1}>
        <ArchHero testID="next-prayer">
          <View
            className="items-center gap-1 pt-6"
            accessible
            accessibilityLabel={`${c.nextPrayer}: ${name(next.prayer.id)}, ${formatClock(next.prayer.minutes)}, ${c.timeLeft} ${formatCountdown(next.msLeft)}`}
          >
            <Text variant="small" tone="hero" weight="medium" className="opacity-70">
              {c.nextPrayer}
            </Text>
            <Text variant="display" tone="hero" className="text-center">
              {name(next.prayer.id)}
            </Text>
            <Text variant="h2" tone="hero" tabular className="text-center">
              {num(formatClock(next.prayer.minutes))}
            </Text>
            <View className="mt-2 items-center">
              <Text variant="caption" tone="hero" className="opacity-70">
                {c.timeLeft}
              </Text>
              <Text variant="h1" tone="hero" tabular className="text-center">
                {num(formatCountdown(next.msLeft))}
              </Text>
            </View>
            <View className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-hero-ink/15">
              <View
                className="h-full rounded-full bg-emerald-dim"
                style={{ width: `${Math.round(next.elapsed * 100)}%` }}
              />
            </View>
          </View>
        </ArchHero>
      </Block>

      <Block index={2}>
        <SectionTitle icon="clock">{c.todaysPrayers}</SectionTitle>
      </Block>
      <Block index={3}>
        <Card className="overflow-hidden">
          {SAMPLE_DAY.map((p, i) => (
            <View key={p.id} className={i > 0 ? 'border-t border-border' : ''}>
              <PrayerRow
                name={name(p.id)}
                time={num(formatClock(p.minutes))}
                tracked={p.tracked}
                done={!!done[p.id]}
                isNext={p.id === next.prayer.id}
                doneLabel={c.done}
                actionLabel={fill(done[p.id] ? c.markUndone : c.markDone, { name: name(p.id) })}
                onToggle={() => toggle(p.id)}
              />
            </View>
          ))}
        </Card>
      </Block>

      {allDone ? (
        <Block index={0}>
          <Card className="flex-row items-center gap-4 p-4">
            <CompletionCheck play={allDone} label={c.allDone} size={56} />
            <Text variant="title" display weight="bold" className="flex-1">
              {c.allDone}
            </Text>
          </Card>
        </Block>
      ) : null}

      <Block index={4}>
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Tile>
              <ProgressRing
                progress={doneCount / tracked.length}
                label={`${c.prayersToday}: ${doneCount}/${tracked.length}`}
                size={88}
              >
                <Text variant="title" tabular>{`${num(doneCount)}/${num(tracked.length)}`}</Text>
              </ProgressRing>
              <Text variant="small" tone="muted" className="mt-2 text-center">
                {c.prayersToday}
              </Text>
            </Tile>
          </View>
          <View className="flex-1">
            <Tile>
              <View className="h-[88px] items-center justify-center gap-1">
                <Icon name="fire" size={30} color="warm" />
                <Text variant="h1" tabular>
                  {num(SAMPLE_STREAK)}
                </Text>
              </View>
              <Text variant="small" tone="muted" className="mt-2 text-center">
                {`${c.streak} · ${c.days}`}
              </Text>
            </Tile>
          </View>
        </View>
      </Block>

      <Block index={5}>
        <Card className="gap-3 p-4">
          <View className="flex-row items-baseline justify-between">
            <Text variant="lead" display weight="bold" className="flex-1">
              {c.thisWeek}
            </Text>
            <Text
              variant="small"
              tone="muted"
              tabular
            >{`${c.average} ${num(average)}/${num(5)}`}</Text>
          </View>
          <WeekBars values={SAMPLE_WEEK} todayIndex={todayIndex} labels={weekdayLabels} />
        </Card>
      </Block>

      <Block index={6}>
        <View className="flex-row gap-3">
          {quick.map((q) => (
            <View key={q.label} className="flex-1">
              <PressableScale
                onPress={q.onPress}
                accessibilityRole="button"
                accessibilityLabel={q.label}
                className="min-h-20 items-center justify-center gap-1.5 rounded-card border border-border bg-deep p-3"
              >
                <Icon name={q.icon} size={26} color="gold" />
                <Text variant="small" weight="semibold" tight className="text-center">
                  {q.label}
                </Text>
              </PressableScale>
            </View>
          ))}
        </View>
      </Block>

      <Text variant="caption" tone="faint" className="text-center">
        {c.sampleNote}
      </Text>
    </Screen>
  );
}
