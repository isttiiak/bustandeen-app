import { copyFor } from '@/features/home/copy';
import { TabPlaceholder } from '@/features/home/screens/TabPlaceholder';
import { useLang } from '@/features/settings/langStore';

export function ZikrScreen() {
  return <TabPlaceholder title={copyFor(useLang()).tabZikr} icon="counter" />;
}
