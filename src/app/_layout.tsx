import '../global.css';

import { Stack } from 'expo-router';
import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ErrorScreen } from '@/features/errors/ErrorScreen';
import { installErrorHooks, useTrackRoute } from '@/features/errors/reporting';
import { I18nProvider } from '@/features/settings/I18nProvider';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { MotionPreference } from '@/ui/motion';
import { ToastProvider } from '@/ui/Overlays';

// react-native-css-interop (NativeWind, D14) reads React Native's deprecated `ImageBackground` when it
// loads, which logs this dev-only warning on every start. Hidden so real warnings stay visible; if
// React Native removes ImageBackground, NativeWind must be updated or replaced (doc 00, G1).
LogBox.ignoreLogs(['ImageBackground is deprecated']);

// Crash reports for uncaught errors and unhandled promise failures (release builds only).
installErrorHooks();

/** A screen that crashes while drawing shows a calm error screen instead of a blank app. */
export const ErrorBoundary = ErrorScreen;

export default function RootLayout() {
  useTrackRoute();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <I18nProvider>
        <ThemeProvider>
          <ToastProvider>
            <MotionPreference />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: 'transparent' },
              }}
            />
          </ToastProvider>
        </ThemeProvider>
      </I18nProvider>
    </GestureHandlerRootView>
  );
}
