import { TabPlaceholder } from '@/features/home/screens/TabPlaceholder';
import { useTranslation } from 'react-i18next';

export function QuranScreen() {
  const { t } = useTranslation();
  return <TabPlaceholder title={t('home.quick.quran')} icon="book" />;
}
