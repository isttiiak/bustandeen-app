import { TabPlaceholder } from '@/features/home/screens/TabPlaceholder';
import { useTranslation } from 'react-i18next';

export function SalatScreen() {
  const { t } = useTranslation();
  return <TabPlaceholder title={t('app.tabSalat')} icon="clock" />;
}
