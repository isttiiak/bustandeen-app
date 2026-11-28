import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLang } from '@/features/settings/langStore';
import { digits } from '@/lib/format';
import { Card } from '@/ui/Card';
import { Text } from '@/ui/Text';

// Literal class names so Tailwind can see them.
const FILL = {
  greg: { now: 'bg-ink', past: 'bg-ink/45', ahead: 'bg-ink/15' },
  hijri: { now: 'bg-gold', past: 'bg-gold/45', ahead: 'bg-gold/15' },
  bn: { now: 'bg-emerald', past: 'bg-emerald/45', ahead: 'bg-emerald/15' },
} as const;

export interface YearLine {
  kind: keyof typeof FILL;
  /** Month and year, e.g. "November 2026". */
  name: string;
  /** 1-12 */
  month: number;
}

/** Where today is in each calendar's year: twelve months, the current one raised. */
export function YearLines({ lines }: { lines: readonly YearLine[] }) {
  const { t } = useTranslation();
  const lang = useLang();
  return (
    <Card className="gap-4 p-4">
      {lines.map((line) => {
        const place = t('app.events.month', { n: digits(line.month, lang) });
        return (
          <View key={line.kind} accessible accessibilityLabel={`${line.name}, ${place}`}>
            <View className="flex-row items-center justify-between gap-2">
              <Text variant="small" weight="semibold" className="flex-1">
                {line.name}
              </Text>
              <Text variant="caption" tone="muted">
                {place}
              </Text>
            </View>
            <View className="mt-1.5 h-3 flex-row items-center gap-[3px]">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <View
                  key={m}
                  className={`flex-1 rounded-full ${
                    m === line.month
                      ? `h-2.5 ${FILL[line.kind].now}`
                      : `h-1.5 ${m < line.month ? FILL[line.kind].past : FILL[line.kind].ahead}`
                  }`}
                />
              ))}
            </View>
          </View>
        );
      })}
    </Card>
  );
}
