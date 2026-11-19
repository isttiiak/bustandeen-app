import { copyFor } from '@/features/home/copy';
import { TabPlaceholder } from '@/features/home/screens/TabPlaceholder';
import { useLang } from '@/features/settings/langStore';

/** "Today's": special days, their details and the Bustandeen calendar. Designed after Home. */
export function EventsScreen() {
  return <TabPlaceholder title={copyFor(useLang()).tabEvents} icon="sun" />;
}
