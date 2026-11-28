import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';
import { useTranslation } from 'react-i18next';

import { useLang } from '@/features/settings/langStore';
import { digits } from '@/lib/format';
import { useTheme } from '@/theme/ThemeProvider';
import { Card } from '@/ui/Card';
import { Icon } from '@/ui/Icon';
import { PressableScale } from '@/ui/PressableScale';
import { Text } from '@/ui/Text';

import { addDays, type DayEvent, type UpcomingEvent } from '../data/source';
import { civil, civilShort, eventDetail, eventName, hijriDay, inDays } from '../logic/text';

/** The mark of each kind of day: a shape as well as a colour (circle, square, diamond as on the web). */
function Mark({ type }: { type: DayEvent['type'] }) {
  const theme = useTheme();
  return (
    <Svg
      width={12}
      height={12}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {type === 'islamic' ? (
        <Circle cx={6} cy={6} r={5} fill={theme.color('emerald')} />
      ) : type === 'holiday' ? (
        <Rect x={1.5} y={1.5} width={9} height={9} rx={2} fill={theme.color('danger')} />
      ) : (
        <Rect
          x={2.5}
          y={2.5}
          width={7}
          height={7}
          fill={theme.color('gold')}
          transform="rotate(45 6 6)"
        />
      )}
    </Svg>
  );
}

function Rows({ children }: { children: ReactNode[] }) {
  return (
    <Card className="px-3.5 py-1">
      {children.map((child, i) => (
        <View key={i} className={i > 0 ? 'border-t border-border/70' : ''}>
          {child}
        </View>
      ))}
    </Card>
  );
}

const ROW = 'min-h-14 flex-row items-center gap-3 py-2';

/** Today's events. Islamic days open their page; holidays and national days are only named. */
export function TodayRows({
  ymd,
  events,
  onOpen,
}: {
  ymd: string;
  events: readonly DayEvent[];
  onOpen: () => void;
}) {
  const { t } = useTranslation();
  const lang = useLang();
  return (
    <Rows>
      {events.map((e, i) => {
        const name = eventName(e, lang);
        const detail = eventDetail(e, t, lang);
        const night =
          e.type === 'islamic' && e.night
            ? t('calendar.nightNote', {
                eve: civil(addDays(ymd, -1), lang, {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'short',
                }),
              })
            : null;
        const label = [name, detail, ...(night ? [night] : [])].join(', ');
        const body = (
          <>
            <Mark type={e.type} />
            <View className="flex-1">
              <Text weight="semibold">{name}</Text>
              <Text variant="small" tone="muted">
                {detail}
              </Text>
              {night ? (
                <Text variant="small" tone="muted">
                  {night}
                </Text>
              ) : null}
            </View>
          </>
        );
        return e.type === 'islamic' ? (
          <PressableScale
            key={i}
            onPress={onOpen}
            accessibilityRole="button"
            accessibilityLabel={label}
            className={ROW}
          >
            {body}
            <Icon name="chevron-end" size={18} mirrorInRtl />
          </PressableScale>
        ) : (
          <View key={i} accessible accessibilityLabel={label} className={ROW}>
            {body}
          </View>
        );
      })}
    </Rows>
  );
}

/** The next days, with how far away each one is. */
export function UpcomingRows({
  rows,
  onOpen,
}: {
  rows: readonly UpcomingEvent[];
  onOpen: () => void;
}) {
  const { t } = useTranslation();
  const lang = useLang();
  return (
    <Rows>
      {rows.map(({ ymd, hijri, daysAway, event }) => {
        const name = eventName(event, lang);
        const when = inDays(daysAway, t, lang);
        const dates = `${civilShort(ymd, lang)} · ${hijriDay(hijri, lang)}`;
        return (
          <PressableScale
            key={`${ymd}-${name}`}
            onPress={onOpen}
            accessibilityRole="button"
            accessibilityLabel={[name, t(`calendar.kind.${event.type}`), dates, when].join(', ')}
            className={ROW}
          >
            <View className="w-12 items-center rounded-control bg-surface py-1">
              <Text variant="lead" weight="bold" tight tabular>
                {digits(Number(ymd.slice(8)), lang)}
              </Text>
              <Text variant="caption" tone="muted" tight>
                {civil(ymd, lang, { weekday: 'short' })}
              </Text>
            </View>
            <View className="flex-1">
              <Text weight="semibold">{name}</Text>
              <View className="flex-row items-center gap-1.5">
                <Mark type={event.type} />
                <Text variant="small" tone="muted" className="flex-1">
                  {dates}
                </Text>
              </View>
              <Text variant="small" tone="gold" weight="semibold">
                {when}
              </Text>
            </View>
          </PressableScale>
        );
      })}
    </Rows>
  );
}
