import '../global.css';

import { Stack } from 'expo-router';
import { LogBox } from 'react-native';

import { ThemeProvider } from '@/theme/ThemeProvider';

// react-native-css-interop (NativeWind, D14) reads React Native's deprecated `ImageBackground` when it
// loads, which logs this dev-only warning on every start. Hidden so real warnings stay visible; if
// React Native removes ImageBackground, NativeWind must be updated or replaced (doc 00, G1).
LogBox.ignoreLogs(['ImageBackground is deprecated']);

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}
      />
    </ThemeProvider>
  );
}
