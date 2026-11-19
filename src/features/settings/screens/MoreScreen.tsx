import { View } from 'react-native';

import { copyFor } from '@/features/home/copy';
import { setThemeMode, useThemeMode } from '@/theme/ThemeProvider';
import type { ThemeMode } from '@/theme/resolve';
import { color, type ThemeName } from '@/theme/tokens';
import { Icon } from '@/ui/Icon';
import { Segmented } from '@/ui/Inputs';
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
  warm: 'warm',
  mixed: 'mixed',
};

export function MoreScreen() {
  const lang = useLang();
  const mode = useThemeMode();
  const c = copyFor(lang);
  const modes: { value: ThemeMode; label: string }[] = [
    { value: 'dark', label: c.themeDark },
    { value: 'warm', label: c.themeWarm },
    { value: 'mixed', label: c.themeMixed },
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
      <SectionTitle>{c.language}</SectionTitle>
      <Segmented
        options={[
          { value: 'en', label: 'English' },
          { value: 'bn', label: 'বাংলা' },
        ]}
        value={lang}
        onChange={setLang}
      />
      <Text variant="caption" tone="faint" className="text-center">
        {c.prototype}
      </Text>
    </Screen>
  );
}
