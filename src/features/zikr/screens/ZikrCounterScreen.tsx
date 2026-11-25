import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { useLang } from '@/features/settings/langStore';
import { digits } from '@/lib/format';
import { ArchHero } from '@/ui/Art';
import { IconButton } from '@/ui/Button';
import { haptic } from '@/ui/haptics';
import { Icon, type IconName } from '@/ui/Icon';
import { Chip } from '@/ui/Inputs';
import { duration, useEntering } from '@/ui/motion';
import { Dialog, useToast } from '@/ui/Overlays';
import { PressableScale } from '@/ui/PressableScale';
import { Screen } from '@/ui/Screen';
import { Text } from '@/ui/Text';

import { CounterDial, type DialBeat } from '../components/CounterDial';
import { TargetSheet } from '../components/TargetSheet';
import { BUILT_IN_ZIKR, findZikr, zikrName } from '../content';
import { DEFAULT_DAILY_GOAL } from '../logic/streak';
import { completesSet, isMilestone, setProgress } from '../logic/target';
import { countsOf, useZikr, zikrStore } from '../store';

/** The zikr counter (task P2-zikr-counter). Opened from the Home Zikr card. Local only, no sync. */
export function ZikrCounterScreen() {
  const { t } = useTranslation();
  const lang = useLang();
  const router = useRouter();
  const store = zikrStore();
  const snap = useZikr(store);
  const num = (n: number) => digits(n, lang);

  const zikr = findZikr(snap.selected) ?? BUILT_IN_ZIKR[0]!;
  const name = zikrName(zikr.type, lang);
  const { count, shown } = countsOf(snap, zikr.type);

  // The target set is session state, as on the web: it starts again when the screen opens and when
  // the zikr, the target or the day changes, and after a reset.
  const ready = snap.status === 'ready';
  const setKey = `${ready}|${zikr.type}|${snap.targetOn}|${snap.target}|${snap.day}`;
  const [set, setSet] = useState({ key: setKey, start: shown });
  let setStart = set.start;
  if (set.key !== setKey) {
    setStart = shown;
    setSet({ key: setKey, start: shown });
  }
  const setSetStart = (n: number) => setSet({ key: setKey, start: n });
  const start = Math.min(setStart, shown);
  const [completed, setCompleted] = useState(0);
  const [beat, setBeat] = useState<DialBeat>({ key: 0, kind: 'tap' });
  const play = (kind: DialBeat['kind']) => setBeat((b) => ({ key: b.key + 1, kind }));
  const toast = useToast();

  const [sheet, setSheet] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  useFocusEffect(
    useCallback(() => {
      store.refreshDay();
    }, [store])
  );

  // Haptics (doc 06 section 7): a light tick per count, medium at every 33 without a target and on
  // reset, a selection click on undo, success when a set completes and when today's total first reaches
  // the daily goal (the web celebrates the same moment). Nothing for "nothing to undo".
  const onCount = () => {
    const before = snap.todayTotal;
    const after = store.increment();
    if (after === null) return;
    const setDone = snap.targetOn && completesSet(after, start, snap.target);
    const goalReached = before < DEFAULT_DAILY_GOAL && before + 1 >= DEFAULT_DAILY_GOAL;
    if (setDone) {
      // CompletionCheck plays the success haptic itself.
      setSetStart(after);
      setCompleted((k) => k + 1);
    } else if (goalReached) {
      haptic('success');
    } else if (!snap.targetOn && isMilestone(after)) {
      haptic('medium');
    } else {
      haptic('tick');
    }
    play(!snap.targetOn && isMilestone(after) ? 'milestone' : 'tap');
    if (goalReached) toast.show(t('zikr.a11y.goalReached'), 'success');
  };

  const onUndo = () => {
    if (store.undo()) {
      haptic('select');
      play('undo');
    } else {
      play('blocked');
    }
  };

  const onReset = () => {
    store.reset();
    setSetStart(0);
    setConfirmReset(false);
    haptic('medium');
    play('reset');
  };

  const onSelect = (type: string) => {
    if (type === zikr.type) return;
    store.select(type);
    play('switch');
  };

  const target = snap.targetOn ? setProgress(shown, start, snap.target) : null;
  const value = target ? target.remaining : shown;
  const caption = target
    ? t('app.zikr.ofTargetToday', {
        done: num(target.done),
        target: num(snap.target),
        today: num(count),
      })
    : t('app.zikr.todayCount', { count: num(count) });

  return (
    <Screen>
      <View className="flex-1 gap-3 pb-2">
        <Enter index={0} className="flex-row items-center gap-2">
          <IconButton
            icon="chevron-start"
            label={t('common.back')}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          />
          <Text variant="title" display weight="bold" className="flex-1">
            {t('home.quick.zikr')}
          </Text>
          <PressableScale
            haptic="select"
            onPress={() => setSheet(true)}
            accessibilityRole="button"
            accessibilityLabel={
              snap.targetOn
                ? t('app.zikr.targetChip', { count: num(snap.target) })
                : t('app.zikr.noTarget')
            }
            className={`min-h-12 flex-row items-center gap-1.5 rounded-full border px-3 ${
              snap.targetOn ? 'border-gold bg-gold/10' : 'border-border bg-surface/50'
            }`}
          >
            <Icon name="counter" size={16} color="gold" />
            <Text variant="small" weight="semibold" tight>
              {snap.targetOn
                ? t('app.zikr.targetChip', { count: num(snap.target) })
                : t('app.zikr.noTarget')}
            </Text>
          </PressableScale>
        </Enter>

        <Enter index={1}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="grow-0"
            contentContainerClassName="gap-2 px-1 py-2"
          >
            {BUILT_IN_ZIKR.map((z) => (
              <Chip
                key={z.type}
                label={zikrName(z.type, lang)}
                selected={z.type === zikr.type}
                onPress={() => onSelect(z.type)}
              />
            ))}
          </ScrollView>
        </Enter>

        <Enter index={2}>
          <ArchHero>
            {/* A new zikr fades in (a fade only, so it also suits reduce motion). */}
            <Animated.View
              key={zikr.type}
              entering={FadeIn.duration(duration.slow)}
              className="items-center gap-1"
              accessible
              accessibilityLabel={name}
            >
              <Text
                variant="h2"
                weight="regular"
                tone="hero"
                className="text-center"
                style={{ writingDirection: 'rtl', lineHeight: 44, fontSize: 28 }}
                accessibilityLanguage="ar"
              >
                {zikr.arabic}
              </Text>
              <Text variant="small" tone="heroGold" className="text-center">
                {zikr.transliteration}
              </Text>
              <Text variant="small" tone="hero" className="text-center opacity-80">
                {t(zikr.meaningKey)}
              </Text>
            </Animated.View>
          </ArchHero>
        </Enter>

        <Enter index={3} className="flex-1">
          {snap.status === 'error' ? (
            <View className="flex-1 items-center justify-center px-4">
              <Text tone="muted" className="text-center">
                {t('app.zikr.storageError')}
              </Text>
            </View>
          ) : (
            <CounterDial
              value={num(value)}
              progress={target ? target.progress : (shown % 33) / 33}
              unit={target ? t('app.zikr.left') : undefined}
              caption={caption}
              label={`${t('zikr.countBtn')}: ${name}`}
              hint={t('app.zikr.tapHint')}
              completeLabel={t('zikr.tasbihSetComplete', { count: num(snap.target) })}
              completeKey={completed}
              beat={beat}
              onPress={onCount}
            />
          )}
        </Enter>

        <Enter index={4} className="flex-row items-center justify-between">
          <BottomAction icon="undo" label={t('app.zikr.undo')} onPress={onUndo} mirror />
          <BottomAction
            icon="refresh"
            label={t('zikr.resetBtn')}
            onPress={() => setConfirmReset(true)}
            end
          />
        </Enter>
      </View>

      <TargetSheet
        visible={sheet}
        onClose={() => setSheet(false)}
        lang={lang}
        targetOn={snap.targetOn}
        target={snap.target}
        onChoose={(v) => store.setTarget(v)}
      />
      <Dialog
        visible={confirmReset}
        onClose={() => setConfirmReset(false)}
        title={t('zikr.resetConfirmTitle', { name })}
        message={t('app.zikr.resetNote', { count: num(count) })}
        actions={[
          { label: t('zikr.resetBtn'), variant: 'danger', onPress: onReset },
          { label: t('common.cancel'), onPress: () => setConfirmReset(false) },
        ]}
      />
    </Screen>
  );
}

/** Undo and Reset sit at the bottom, away from the counting area's middle and the top corners. */
function BottomAction({
  icon,
  label,
  onPress,
  mirror,
  end,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  mirror?: boolean;
  end?: boolean;
}) {
  return (
    <PressableScale
      haptic={false}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`min-h-12 flex-row items-center gap-2 rounded-full bg-surface/60 px-4 ${
        end ? 'flex-row-reverse' : ''
      }`}
    >
      <Icon name={icon} size={20} mirrorInRtl={mirror} />
      <Text variant="small" weight="semibold" tight>
        {label}
      </Text>
    </PressableScale>
  );
}

/** The screen's parts arrive in a short stagger when it opens (a fade with reduce motion). */
function Enter({
  index,
  className,
  children,
}: {
  index: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Animated.View entering={useEntering(index)} className={className}>
      {children}
    </Animated.View>
  );
}
