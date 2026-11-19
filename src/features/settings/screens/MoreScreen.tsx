import { View } from 'react-native';

import { setProto, useProto, type HeroFrameKind, type HomeLayout } from '@/features/home/proto';
import { setThemeMode, useThemeMode } from '@/theme/ThemeProvider';
import type { ThemeMode } from '@/theme/resolve';
import { color, type ThemeName } from '@/theme/tokens';
import { Icon } from '@/ui/Icon';
import { Chip, Segmented } from '@/ui/Inputs';
import { PressableScale } from '@/ui/PressableScale';
import { SectionTitle } from '@/ui/Layout';
import { Screen } from '@/ui/Screen';
import { Text } from '@/ui/Text';

import { setLang, useLang } from '../langStore';
import { useTranslation } from 'react-i18next';

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

// Pretend times that land in each hero state (sample schedule in features/home/schedule.ts).
const TIMES: readonly [string, number][] = [
  ['04:30 before Fajr', 4 * 60 + 30],
  ['06:25 forbidden', 6 * 60 + 25],
  ['09:00 between', 9 * 60],
  ['11:48 forbidden', 11 * 60 + 48],
  ['13:00 Dhuhr', 13 * 60],
  ['16:00 Asr', 16 * 60],
  ['17:15 forbidden', 17 * 60 + 15],
  ['18:00 Maghrib', 18 * 60],
  ['21:00 Isha', 21 * 60],
];

export function MoreScreen() {
  const lang = useLang();
  const mode = useThemeMode();
  const proto = useProto();
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
      <SectionTitle>{t('proto.protoFrame')}</SectionTitle>
      <Segmented
        options={[
          { value: 'arch', label: t('proto.frameArch') },
          { value: 'plain', label: t('proto.framePlain') },
        ]}
        value={proto.frame}
        onChange={(v: HeroFrameKind) => setProto({ frame: v })}
      />
      <SectionTitle>{t('proto.protoRow')}</SectionTitle>
      <Segmented
        options={[
          { value: 'show', label: t('proto.rowShow') },
          { value: 'hide', label: t('proto.rowHide') },
        ]}
        value={proto.prayerRow ? 'show' : 'hide'}
        onChange={(v: string) => setProto({ prayerRow: v === 'show' })}
      />
      <SectionTitle>{t('settings.language')}</SectionTitle>
      <Segmented
        options={[
          { value: 'en', label: 'English' },
          { value: 'bn', label: 'বাংলা' },
        ]}
        value={lang}
        onChange={setLang}
      />
      <SectionTitle>{t('proto.protoLayout')}</SectionTitle>
      <Segmented
        options={[
          { value: 'a', label: t('proto.layoutA') },
          { value: 'b', label: t('proto.layoutB') },
        ]}
        value={proto.layout}
        onChange={(v: HomeLayout) => setProto({ layout: v })}
      />
      <SectionTitle>{t('proto.protoTime')}</SectionTitle>
      <View className="flex-row flex-wrap gap-2">
        <Chip
          label={t('proto.protoLive')}
          selected={proto.simMinutes == null}
          onPress={() => setProto({ simMinutes: null })}
        />
        {TIMES.map(([label, minutes]) => (
          <Chip
            key={label}
            label={label}
            selected={proto.simMinutes === minutes}
            onPress={() => setProto({ simMinutes: minutes })}
          />
        ))}
      </View>
      <SectionTitle>{t('proto.protoFasting')}</SectionTitle>
      <Segmented
        options={[
          { value: 'on', label: t('proto.protoOn') },
          { value: 'off', label: t('proto.protoOff') },
        ]}
        value={proto.fasting ? 'on' : 'off'}
        onChange={(v: string) => setProto({ fasting: v === 'on' })}
      />
      <SectionTitle>{t('proto.protoData')}</SectionTitle>
      <Segmented
        options={[
          { value: 'active', label: t('proto.protoActive') },
          { value: 'empty', label: t('proto.protoEmpty') },
        ]}
        value={proto.active ? 'active' : 'empty'}
        onChange={(v: string) => setProto({ active: v === 'active' })}
      />
      <Text variant="caption" tone="faint" className="text-center">
        {t('proto.prototype')}
      </Text>
    </Screen>
  );
}
