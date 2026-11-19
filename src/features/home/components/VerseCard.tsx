import { View } from 'react-native';

import type { Lang } from '@/features/settings/langStore';
import { Card } from '@/ui/Card';
import { Icon } from '@/ui/Icon';
import { Text } from '@/ui/Text';

import type { Verse } from '../verses';
import { useTranslation } from 'react-i18next';
import { digits } from '@/lib/format';

/** The verse of the day: Arabic first, then the translation in the app language, then the reference. */
export function VerseCard({ verse, lang }: { verse: Verse; lang: Lang }) {
  const { t } = useTranslation();
  const ref = digits(verse.key, lang);
  return (
    <Card className="gap-3 p-5">
      <View className="flex-row items-center gap-2">
        <Icon name="book" size={16} color="gold" />
        <Text variant="caption" tone="gold" weight="semibold" className="flex-1">
          {t('app.verseOfDay')}
        </Text>
        <Text variant="caption" tone="muted" tabular>
          {t('app.quranRef', { ref })}
        </Text>
      </View>
      <Text
        variant="h2"
        weight="regular"
        className="text-center"
        style={{ writingDirection: 'rtl', lineHeight: 44, fontSize: 24 }}
        accessibilityLanguage="ar"
      >
        {verse.arabic}
      </Text>
      <Text variant="small" tone="muted" className="text-center">
        {lang === 'bn' ? verse.bn : verse.en}
      </Text>
    </Card>
  );
}
