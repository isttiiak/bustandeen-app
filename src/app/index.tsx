import { StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { paletteFor } from '@/theme/colors';
import { fonts } from '@/theme/fonts';

// P0 check screen (task P0, B4): proves the bundled fonts are embedded and that Bangla is shaped
// correctly on the device. Replaced by the Today tab prototype in Phase 2.
//
// The two lines are existing web strings (`authSignUp.subtitle` in the web's en and bn
// common.json), not new copy. i18n arrives in Phase 2.
export const HELLO_TEXT = {
  appName: 'Bustandeen',
  en: 'Start your spiritual journey today',
  bn: 'আজই আপনার আধ্যাত্মিক যাত্রা শুরু করুন',
} as const;

export default function HelloScreen() {
  const colors = paletteFor(useColorScheme());

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.void }]}>
      <View style={styles.content}>
        <Text accessibilityRole="header" style={[styles.appName, { color: colors.gold }]}>
          {HELLO_TEXT.appName}
        </Text>
        <Text style={[styles.english, { color: colors.ink }]}>{HELLO_TEXT.en}</Text>
        <Text style={[styles.bangla, { color: colors.emerald }]}>{HELLO_TEXT.bn}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  appName: {
    fontFamily: fonts.display,
    fontWeight: '700',
    fontSize: 36,
    lineHeight: 48,
  },
  // Body lines take the full width instead of shrinking to their measured width. On Android
  // (Expo SDK 58, React Native 0.88), a shrink-to-fit Text in Hind Siliguri is measured about
  // 2.5% narrower than it is drawn, so its last word wraps onto a line with no room and is cut
  // off (found on the emulator, 2026-11-19).
  english: {
    alignSelf: 'stretch',
    fontFamily: fonts.body,
    fontSize: 18,
    lineHeight: 27,
    textAlign: 'center',
  },
  bangla: {
    alignSelf: 'stretch',
    fontFamily: fonts.bangla,
    fontSize: 20,
    // Bangla needs more height than Latin (doc 06: 1.6-1.7).
    lineHeight: 34,
    textAlign: 'center',
  },
});
