import { EmptyState } from '@/ui/Layout';
import { Screen } from '@/ui/Screen';
import { useTranslation } from 'react-i18next';

/** Stand-in for a tab whose feature arrives in a later phase (prototype only). */
export function TabPlaceholder({
  title,
  icon,
}: {
  title: string;
  icon?: 'clock' | 'book' | 'counter' | 'sun';
}) {
  const { t } = useTranslation();
  return (
    <Screen>
      <EmptyState title={title} message={t('app.soon')} icon={icon} />
    </Screen>
  );
}
