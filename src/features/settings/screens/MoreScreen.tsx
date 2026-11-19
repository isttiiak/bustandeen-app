import { View } from 'react-native';

import { copyFor } from '@/features/home/copy';
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
  const c = copyFor(lang);
  const modes: { value: ThemeMode; label: string }[] = [
    { value: 'dark', label: c.themeDark },
    { value: 'night', label: c.themeNight },
    { value: 'sand', label: c.themeSand },
    { value: 'light', label: c.themeLight },
    { value: 'system', label: c.themeSystem },
    { value: 'daylight', label: c.themeDaylight },
  ];

  return (
    <Screen scroll>
      <Text variant="h1">{c.moreTitle}</Text>
      <SectionTitle icon="moon">{c.appearance}</SectionTitle>
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
      <SectionTitle>{c.protoFrame}</SectionTitle>
      <Segmented
        options={[
          { value: 'arch', label: c.frameArch },
          { value: 'plain', label: c.framePlain },
        ]}
        value={proto.frame}
        onChange={(v: HeroFrameKind) => setProto({ frame: v })}
      />
      <SectionTitle>{c.language}</SectionTitle>
      <Segmented
        options={[
          { value: 'en', label: 'English' },
          { value: 'bn', label: 'বাংলা' },
        ]}
        value={lang}
        onChange={setLang}
      />
      <SectionTitle>{c.protoLayout}</SectionTitle>
      <Segmented
        options={[
          { value: 'a', label: c.layoutA },
          { value: 'b', label: c.layoutB },
        ]}
        value={proto.layout}
        onChange={(v: HomeLayout) => setProto({ layout: v })}
      />
      <SectionTitle>{c.protoTime}</SectionTitle>
      <View className="flex-row flex-wrap gap-2">
        <Chip
          label={c.protoLive}
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
      <SectionTitle>{c.protoFasting}</SectionTitle>
      <Segmented
        options={[
          { value: 'on', label: c.protoOn },
          { value: 'off', label: c.protoOff },
        ]}
        value={proto.fasting ? 'on' : 'off'}
        onChange={(v: string) => setProto({ fasting: v === 'on' })}
      />
      <SectionTitle>{c.protoData}</SectionTitle>
      <Segmented
        options={[
          { value: 'active', label: c.protoActive },
          { value: 'empty', label: c.protoEmpty },
        ]}
        value={proto.active ? 'active' : 'empty'}
        onChange={(v: string) => setProto({ active: v === 'active' })}
      />
      <Text variant="caption" tone="faint" className="text-center">
        {c.prototype}
      </Text>
    </Screen>
  );
}
