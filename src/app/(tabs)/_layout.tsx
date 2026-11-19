import { Tabs } from 'expo-router';

import { copyFor } from '@/features/home/copy';
import { useLang } from '@/features/settings/langStore';
import type { IconName } from '@/ui/Icon';
import { TabBar } from '@/ui/TabBar';

const ICONS: Record<string, IconName> = {
  index: 'home',
  salat: 'clock',
  quran: 'book',
  events: 'sun',
  more: 'dots',
};

export default function TabsLayout() {
  const c = copyFor(useLang());
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} icons={ICONS} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: 'transparent' } }}
    >
      <Tabs.Screen name="index" options={{ title: c.tabHome }} />
      <Tabs.Screen name="salat" options={{ title: c.tabSalat }} />
      <Tabs.Screen name="quran" options={{ title: c.tabQuran }} />
      <Tabs.Screen name="events" options={{ title: c.tabEvents }} />
      <Tabs.Screen name="more" options={{ title: c.tabMore }} />
    </Tabs>
  );
}
