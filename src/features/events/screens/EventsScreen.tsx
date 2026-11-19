import { TabPlaceholder } from '@/features/home/screens/TabPlaceholder';
import { useTranslation } from 'react-i18next';

/** "Today's": special days, their details and the Bustandeen calendar. Designed after Home. */
export function EventsScreen() {
  const { t } = useTranslation();
  return <TabPlaceholder title={t('app.tabEvents')} icon="sun" />;
}
