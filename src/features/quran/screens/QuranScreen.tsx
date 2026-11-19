import { copyFor } from '@/features/home/copy';
import { TabPlaceholder } from '@/features/home/screens/TabPlaceholder';
import { useLang } from '@/features/settings/langStore';

export function QuranScreen() {
  return <TabPlaceholder title={copyFor(useLang()).tabQuran} icon="book" />;
}
