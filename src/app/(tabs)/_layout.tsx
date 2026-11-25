import { Tabs } from 'expo-router';

import { ErrorScreen } from '@/features/errors/ErrorScreen';
import type { IconName } from '@/ui/Icon';
import { TabBar } from '@/ui/TabBar';
import { useTranslation } from 'react-i18next';

const ICONS: Record<string, IconName> = {
  index: 'home',
  salat: 'clock',
  quran: 'book',
  events: 'sun',
  more: 'dots',
};

/** A crash inside a tab shows the error screen there. */
export const ErrorBoundary = ErrorScreen;

export default function TabsLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} icons={ICONS} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: 'transparent' } }}
    >
      <Tabs.Screen name="index" options={{ title: t('nav.home') }} />
      <Tabs.Screen name="salat" options={{ title: t('app.tabSalat') }} />
      <Tabs.Screen name="quran" options={{ title: t('home.quick.quran') }} />
      <Tabs.Screen name="events" options={{ title: t('app.tabEvents') }} />
      <Tabs.Screen name="more" options={{ title: t('app.tabMore') }} />
    </Tabs>
  );
}
