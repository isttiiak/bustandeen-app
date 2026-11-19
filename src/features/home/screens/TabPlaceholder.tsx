import { useLang } from '@/features/settings/langStore';
import { EmptyState } from '@/ui/Layout';
import { Screen } from '@/ui/Screen';
import { copyFor } from '../copy';

/** Stand-in for a tab whose feature arrives in a later phase (prototype only). */
export function TabPlaceholder({
  title,
  icon,
}: {
  title: string;
  icon?: 'clock' | 'book' | 'counter';
}) {
  const c = copyFor(useLang());
  return (
    <Screen>
      <EmptyState title={title} message={c.soon} icon={icon} />
    </Screen>
  );
}
