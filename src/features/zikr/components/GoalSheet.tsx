import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput, View } from 'react-native';

import { digits } from '@/lib/format';
import type { Lang } from '@/lib/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { Button } from '@/ui/Button';
import { Chip, Segmented } from '@/ui/Inputs';
import { Sheet } from '@/ui/Overlays';
import { Text } from '@/ui/Text';

import { GOAL_PRESETS, GRACE_OPTIONS, isValidTarget, type ZikrGoal } from '../logic/goal';

const toLatinDigits = (s: string) =>
  s.replace(/[০-৯]/g, (d) => String(d.charCodeAt(0) - 0x09e6)).trim();

/** Daily zikr goal and grace days (the web's goal dialog on the Zikr analytics page). */
export function GoalSheet({
  visible,
  onClose,
  lang,
  goal,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  lang: Lang;
  goal: ZikrGoal;
  onSave: (goal: ZikrGoal) => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  // The draft starts from the saved goal each time the sheet opens (a new key remounts it).
  const [target, setTarget] = useState(goal.dailyTarget);
  const [typed, setTyped] = useState('');
  const [grace, setGrace] = useState(goal.graceDays);
  const [invalid, setInvalid] = useState(false);

  const save = () => {
    const value = typed ? Number(toLatinDigits(typed)) : target;
    if (!isValidTarget(value)) {
      setInvalid(true);
      return;
    }
    onSave({ dailyTarget: value, graceDays: grace });
    onClose();
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={t('zikrAnalytics.setDailyGoal')}
      closeLabel={t('app.closeSheet')}
    >
      <View className="gap-3 pb-2">
        <Text variant="small" weight="semibold">
          {t('zikrAnalytics.dailyTarget')}
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {GOAL_PRESETS.map((n) => (
            <Chip
              key={n}
              label={digits(n, lang)}
              selected={!typed && target === n}
              onPress={() => {
                setTarget(n);
                setTyped('');
                setInvalid(false);
              }}
              testID={`goal-${n}`}
            />
          ))}
        </View>
        <TextInput
          value={typed}
          onChangeText={(v) => {
            setTyped(v);
            setInvalid(false);
          }}
          keyboardType="number-pad"
          maxLength={6}
          placeholder={
            (GOAL_PRESETS as readonly number[]).includes(target)
              ? t('zikrAnalytics.enterGoal')
              : digits(target, lang)
          }
          placeholderTextColor={theme.color('ink').replace('rgb(', 'rgba(').replace(')', ', 0.5)')}
          accessibilityLabel={`${t('zikrAnalytics.enterGoal')}, ${t('app.settings.goalRange')}`}
          className="min-h-12 rounded-control border border-border bg-surface/50 px-3 text-ink"
          style={{ fontSize: 16 }}
          testID="goal-input"
        />
        {invalid ? (
          <Text variant="small" tone="danger" accessibilityLiveRegion="polite">
            {t('app.settings.goalRange')}
          </Text>
        ) : null}

        <Text variant="small" weight="semibold" className="mt-1">
          {t('zikrAnalytics.graceDays')}
        </Text>
        <Segmented
          options={GRACE_OPTIONS.map((n) => ({ value: String(n), label: digits(n, lang) }))}
          value={String(grace)}
          onChange={(v: string) => setGrace(Number(v))}
        />
        <View accessible>
          <Text variant="small" weight="semibold">
            {t(`zikrAnalytics.grace${grace}`)}
          </Text>
          <Text variant="small" tone="muted">
            {t('zikrAnalytics.graceDaysNote')}
          </Text>
        </View>
        <Button label={t('zikrAnalytics.saveGoal')} onPress={save} fill testID="goal-save" />
      </View>
    </Sheet>
  );
}
