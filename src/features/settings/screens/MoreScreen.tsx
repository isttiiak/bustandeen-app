import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { GoalSheet } from '@/features/zikr/components/GoalSheet';
import { useZikr, zikrStore } from '@/features/zikr/store';
import { digits } from '@/lib/format';
import { REDUCE_MOTION_MODES, uiPrefs, useUiPrefs, type ReduceMotionMode } from '@/lib/uiPrefs';
import { setThemeMode, useThemeMode } from '@/theme/ThemeProvider';
import type { ThemeMode } from '@/theme/resolve';
import { color, type ThemeName } from '@/theme/tokens';
import { Icon } from '@/ui/Icon';
import { Segmented, Switch } from '@/ui/Inputs';
import { SectionTitle } from '@/ui/Layout';
import { PressableScale } from '@/ui/PressableScale';
import { Screen } from '@/ui/Screen';
import { Text } from '@/ui/Text';

import { DesignReview } from '../components/DesignReview';
import { setLang, useLang } from '../langStore';

// Settings (task P2-17a): appearance, language, the zikr goal and accessibility. Everything is saved on
// the phone under the web's keys where the web has one; P2-14 syncs them. Prototype review switches
// follow in dev builds only.

// Mini preview of each theme (prototype): page, card and accent, read from the tokens.
function Swatch({ theme }: { theme: ThemeName }) {
  const dot = (name: Parameters<typeof color>[1]) => (
    <View style={{ backgroundColor: color(theme, name) }} className="h-3 w-3 rounded-full" />
  );
  return (
    <View
      style={{ backgroundColor: color(theme, 'void'), borderColor: color(theme, 'border') }}
      className="h-10 w-16 flex-row items-center justify-center gap-1 rounded-control border"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {dot('deep')}
      {dot('hero')}
      {dot('emerald')}
      {dot('gold')}
    </View>
  );
}

const PREVIEW: Partial<Record<ThemeMode, ThemeName>> = {
  dark: 'dark',
  light: 'light',
  night: 'night',
  sand: 'sand',
};

export function MoreScreen() {
  const lang = useLang();
  const mode = useThemeMode();
  const prefs = useUiPrefs();
  const zikr = useZikr();
  const [goalOpen, setGoalOpen] = useState(false);
  const router = useRouter();
  const num = (n: number) => digits(n, lang);
  const { t } = useTranslation();
  const modes: { value: ThemeMode; label: string }[] = [
    { value: 'dark', label: t('settings.themeDark') },
    { value: 'night', label: t('app.themeNight') },
    { value: 'sand', label: t('app.themeSand') },
    { value: 'light', label: t('settings.themeLight') },
    { value: 'system', label: t('app.themeSystem') },
    { value: 'daylight', label: t('app.themeDaylight') },
  ];

  return (
    <Screen scroll>
      <Text variant="h1">{t('app.moreTitle')}</Text>
      <SectionTitle icon="moon">{t('settings.appearanceSection')}</SectionTitle>
      <Text variant="small" tone="muted">
        {t('app.settings.appearanceNote')}
      </Text>
      <View className="flex-row flex-wrap gap-3">
        {modes.map((m) => {
          const preview = PREVIEW[m.value];
          const selected = mode === m.value;
          return (
            <View key={m.value} className="w-[47%] grow">
              <PressableScale
                haptic="select"
                onPress={() => setThemeMode(m.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected, checked: selected }}
                accessibilityLabel={m.label}
                className={`min-h-24 items-center justify-center gap-2 rounded-card border p-3 ${
                  selected ? 'border-emerald bg-emerald/10' : 'border-border bg-deep'
                }`}
              >
                {preview ? (
                  <Swatch theme={preview} />
                ) : (
                  <View className="h-10 w-16 items-center justify-center rounded-control border border-border bg-surface">
                    <Icon name={m.value === 'daylight' ? 'sun' : 'moon'} size={20} color="gold" />
                  </View>
                )}
                <Text variant="small" weight={selected ? 'bold' : 'medium'} tight>
                  {m.label}
                </Text>
              </PressableScale>
            </View>
          );
        })}
      </View>
      <SectionTitle icon="book">{t('settings.language')}</SectionTitle>
      <Segmented
        options={[
          { value: 'en', label: 'English' },
          { value: 'bn', label: 'বাংলা' },
        ]}
        value={lang}
        onChange={setLang}
      />

      <SectionTitle icon="counter">{t('home.quick.zikr')}</SectionTitle>
      <ValueRow
        title={t('zikrAnalytics.dailyTarget')}
        detail={t('app.settings.goalDetail')}
        value={num(zikr.goal.dailyTarget)}
        onPress={() => setGoalOpen(true)}
        testID="settings-goal"
      />
      <ValueRow
        title={t('zikrAnalytics.graceDays')}
        value={num(zikr.goal.graceDays)}
        onPress={() => setGoalOpen(true)}
      />
      <ValueRow
        title={t('settings.zikrLibrary')}
        detail={t('settings.zikrLibrarySubtitle')}
        value={digits(zikr.list.length, lang)}
        onPress={() => router.push('/zikr/library')}
        testID="settings-library"
      />

      <SectionTitle icon="info">{t('settings.accessibilitySection')}</SectionTitle>
      <View className="min-h-12 flex-row items-center gap-3 rounded-control border border-border bg-surface/50 p-3">
        <View className="flex-1">
          <Text weight="semibold">{t('settings.vibration')}</Text>
          <Text variant="small" tone="muted">
            {t('app.settings.vibrationDetail')}
          </Text>
        </View>
        <Switch
          value={prefs.vibration}
          onValueChange={(v) => uiPrefs.setVibration(v)}
          label={t('settings.vibration')}
          testID="settings-vibration"
        />
      </View>
      <View className="gap-2 rounded-control border border-border bg-surface/50 p-3">
        <Text weight="semibold">{t('settings.reduceMotion')}</Text>
        <Text variant="small" tone="muted">
          {t('settings.reduceMotionDetail')}
        </Text>
        <Segmented
          options={REDUCE_MOTION_MODES.map((m) => ({
            value: m,
            label: t(`settings.reduceMotion${m[0]!.toUpperCase()}${m.slice(1)}`),
          }))}
          value={prefs.reduceMotion}
          onChange={(v: ReduceMotionMode) => uiPrefs.setReduceMotion(v)}
        />
      </View>

      {__DEV__ ? <DesignReview /> : null}

      {/* A new key each time it opens, so the sheet starts from the saved goal. */}
      <GoalSheet
        key={goalOpen ? 'open' : 'closed'}
        visible={goalOpen}
        onClose={() => setGoalOpen(false)}
        lang={lang}
        goal={zikr.goal}
        onSave={(g) => zikrStore().setGoal(g)}
      />
    </Screen>
  );
}

/** A setting that opens a sheet: title, optional detail, the current value and a chevron. */
function ValueRow({
  title,
  detail,
  value,
  onPress,
  testID,
}: {
  title: string;
  detail?: string;
  value: string;
  onPress: () => void;
  testID?: string;
}) {
  return (
    <PressableScale
      haptic="select"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}: ${value}`}
      accessibilityHint={detail}
      testID={testID}
      className="min-h-12 flex-row items-center gap-3 rounded-control border border-border bg-surface/50 p-3"
    >
      <View className="flex-1">
        <Text weight="semibold">{title}</Text>
        {detail ? (
          <Text variant="small" tone="muted">
            {detail}
          </Text>
        ) : null}
      </View>
      <Text variant="lead" weight="bold" tabular>
        {value}
      </Text>
      <Icon name="chevron-end" size={18} color="gold-dim" mirrorInRtl />
    </PressableScale>
  );
}
