import type { ConfigContext, ExpoConfig } from 'expo/config';

// App identity (decision O13, confirmed by the owner on 2026-11-17).
// The Android package and the iOS bundle identifier cannot change after the
// first store release: do not edit them.
export const APP_ID = 'com.bustandeen.app';
export const APP_SCHEME = 'bustandeen';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Bustandeen',
  slug: 'bustandeen-app',
  version: '1.0.0',
  scheme: APP_SCHEME,
  // Phones are portrait at 1.0 (decision O10). On screens 600dp and wider
  // Android ignores this when targeting API 36, so layouts must still resize.
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  icon: './assets/images/icon.png',
  ios: {
    bundleIdentifier: APP_ID,
    icon: './assets/expo.icon',
  },
  android: {
    package: APP_ID,
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    // Predictive back is the default for apps targeting API 36 (doc 06).
    predictiveBackGestureEnabled: true,
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#208AEF',
        image: './assets/images/splash-icon.png',
        imageWidth: 76,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
