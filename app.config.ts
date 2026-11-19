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
    // Prebuild adds these to the main manifest, so release builds would request them (D11).
    // Storage is on doc 05's "never requested" list; the overlay permission is only for the dev menu.
    blockedPermissions: [
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.SYSTEM_ALERT_WINDOW',
    ],
  },
  plugins: [
    'expo-router',
    // Fonts embedded at build time (decision D12). Sources and licences: assets/fonts/LICENSES/.
    [
      'expo-font',
      {
        android: {
          fonts: [
            {
              fontFamily: 'Hind Siliguri',
              fontDefinitions: [
                { path: './assets/fonts/HindSiliguri-Regular.ttf', weight: 400 },
                { path: './assets/fonts/HindSiliguri-Medium.ttf', weight: 500 },
                { path: './assets/fonts/HindSiliguri-SemiBold.ttf', weight: 600 },
                { path: './assets/fonts/HindSiliguri-Bold.ttf', weight: 700 },
              ],
            },
            {
              fontFamily: 'Plus Jakarta Sans',
              path: './assets/fonts/PlusJakartaSans-Variable.ttf',
              fontDefinitions: [{ weight: 400 }, { weight: 500 }, { weight: 600 }, { weight: 700 }],
            },
            {
              fontFamily: 'El Messiri',
              path: './assets/fonts/ElMessiri-Variable.ttf',
              fontDefinitions: [{ weight: 400 }, { weight: 500 }, { weight: 600 }, { weight: 700 }],
            },
          ],
        },
        ios: {
          fonts: [
            './assets/fonts/HindSiliguri-Regular.ttf',
            './assets/fonts/HindSiliguri-Medium.ttf',
            './assets/fonts/HindSiliguri-SemiBold.ttf',
            './assets/fonts/HindSiliguri-Bold.ttf',
            './assets/fonts/PlusJakartaSans-Variable.ttf',
            './assets/fonts/ElMessiri-Variable.ttf',
          ],
        },
      },
    ],
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
