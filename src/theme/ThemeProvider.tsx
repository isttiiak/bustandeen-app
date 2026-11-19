import { StatusBar } from 'expo-status-bar';
import { vars } from 'nativewind';
import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { Appearance, useColorScheme, View } from 'react-native';

import { resolveTheme, type ThemeMode } from './resolve';
import { color, tokenVars, type ColorName, type ThemeName } from './tokens';

// The chosen mode lives in a tiny store. It is in memory for now: P2-07 adds encrypted storage and
// P2-14 syncs it under the web key `bustandeen_theme_mode` (see resolve.ts).
let mode: ThemeMode = 'system';
const listeners = new Set<() => void>();

export function setThemeMode(next: ThemeMode): void {
  if (next === mode) return;
  mode = next;
  listeners.forEach((l) => l());
}

export function useThemeMode(): ThemeMode {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => mode
  );
}

interface ThemeValue {
  theme: ThemeName;
  mode: ThemeMode;
  /** Plain colour string for native views and the status bar. Screens use NativeWind classes. */
  color: (name: ColorName) => string;
}
// Outside a provider (a unit test, a story) the dark theme applies instead of crashing.
const ThemeContext = createContext<ThemeValue>({
  theme: 'dark',
  mode: 'system',
  color: (name) => color('dark', name),
});

export function useTheme(): ThemeValue {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const currentMode = useThemeMode();
  // Synchronous on first render (no flash): the system scheme is read before anything paints.
  const system = useColorScheme() ?? Appearance.getColorScheme();
  const theme = resolveTheme(currentMode, { systemScheme: system === 'light' ? 'light' : 'dark' });

  const value = useMemo<ThemeValue>(
    () => ({ theme, mode: currentMode, color: (name) => color(theme, name) }),
    [theme, currentMode]
  );
  const style = useMemo(() => vars(tokenVars(theme)), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      <View style={[{ flex: 1 }, style]} className="bg-void">
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        {children}
      </View>
    </ThemeContext.Provider>
  );
}
