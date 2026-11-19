import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/ui/Text';

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
  return (
    <SafeAreaView className="flex-1 bg-void">
      <View className="flex-1 items-center justify-center gap-4 px-6">
        <Text variant="display" tone="gold">
          {HELLO_TEXT.appName}
        </Text>
        <Text variant="lead" className="text-center">
          {HELLO_TEXT.en}
        </Text>
        <Text variant="title" weight="regular" tone="emerald" className="text-center">
          {HELLO_TEXT.bn}
        </Text>
      </View>
    </SafeAreaView>
  );
}
