import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput, View } from 'react-native';

import { digits } from '@/lib/format';
import type { Lang } from '@/lib/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { Button } from '@/ui/Button';
import { Option } from '@/ui/Inputs';
import { Sheet } from '@/ui/Overlays';
import { Text } from '@/ui/Text';

import { TARGET_MAX, TARGET_MIN, TARGET_PRESETS } from '../logic/target';

/** Pick the target: none (the web's default), one of the web's presets, or a custom number. */
export function TargetSheet({
  visible,
  onClose,
  lang,
  targetOn,
  target,
  onChoose,
}: {
  visible: boolean;
  onClose: () => void;
  lang: Lang;
  targetOn: boolean;
  target: number;
  onChoose: (target: number | null) => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [draft, setDraft] = useState('');
  const [invalid, setInvalid] = useState(false);
  const isPreset = (TARGET_PRESETS as readonly number[]).includes(target);

  const choose = (value: number | null) => {
    onChoose(value);
    setDraft('');
    setInvalid(false);
    onClose();
  };
  const applyCustom = () => {
    // Accept Bangla digits too: the keyboard may type them in a Bangla phone.
    const latin = draft.replace(/[০-৯]/g, (d) => String(d.charCodeAt(0) - 0x09e6));
    const n = Number(latin);
    if (!Number.isInteger(n) || n < TARGET_MIN || n > TARGET_MAX) {
      setInvalid(true);
      return;
    }
    choose(n);
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={t('zikr.tasbihTargetLabel')}
      closeLabel={t('app.closeSheet')}
    >
      <View className="gap-2 pb-2">
        <Option
          label={t('app.zikr.noTarget')}
          selected={!targetOn}
          onPress={() => choose(null)}
          testID="zikr-target-none"
        />
        <View className="flex-row flex-wrap gap-2">
          {TARGET_PRESETS.map((n) => (
            <View key={n} className="min-w-[22%] flex-1">
              <Option
                label={digits(n, lang)}
                selected={targetOn && target === n}
                onPress={() => choose(n)}
                testID={`zikr-target-${n}`}
              />
            </View>
          ))}
        </View>
        <Text variant="small" weight="semibold" className="mt-2">
          {t('zikr.tasbihCustom')}
          {targetOn && !isPreset ? `: ${digits(target, lang)}` : ''}
        </Text>
        <View className="flex-row items-center gap-2">
          <TextInput
            value={draft}
            onChangeText={(v) => {
              setDraft(v);
              setInvalid(false);
            }}
            keyboardType="number-pad"
            maxLength={4}
            placeholder={t('app.zikr.customHint')}
            placeholderTextColor={theme
              .color('ink')
              .replace('rgb(', 'rgba(')
              .replace(')', ', 0.5)')}
            accessibilityLabel={`${t('zikr.tasbihCustom')}, ${t('app.zikr.customHint')}`}
            onSubmitEditing={applyCustom}
            className="min-h-12 flex-1 rounded-control border border-border bg-surface/50 px-3 text-ink"
            style={{ fontSize: 16 }}
          />
          <Button label={t('app.zikr.useCustom')} variant="secondary" onPress={applyCustom} />
        </View>
        {invalid ? (
          <Text variant="small" tone="danger" accessibilityLiveRegion="polite">
            {t('app.zikr.customHint')}
          </Text>
        ) : null}
      </View>
    </Sheet>
  );
}
