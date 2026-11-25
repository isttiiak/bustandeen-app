import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Text } from '@/ui/Text';
import { Card } from '@/ui/Card';
import { Sheet } from '@/ui/Overlays';

import { PrayerRow } from './PrayerRow';
import { PRAYER_KEY, SAMPLE_DAY, formatClock, type PrayerId } from '../schedule';

export function TimesSheet({
  visible,
  onClose,
  num,
  nextId,
}: {
  visible: boolean;
  onClose: () => void;
  num: (v: string | number) => string;
  nextId: PrayerId;
}) {
  const { t } = useTranslation();
  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={t('app.cardTimes')}
      closeLabel={t('app.closeSheet')}
    >
      <Card className="mb-2 overflow-hidden">
        {SAMPLE_DAY.map((p, i) => (
          <View
            key={p.id}
            className={`flex-row items-center justify-between px-4 py-3 ${i > 0 ? 'border-t border-border' : ''} ${
              p.id === nextId ? 'bg-emerald/10' : ''
            }`}
          >
            <Text variant="lead" weight={p.id === nextId ? 'bold' : 'medium'}>
              {t(PRAYER_KEY[p.id])}
            </Text>
            <Text variant="lead" tabular weight={p.id === nextId ? 'bold' : 'regular'}>
              {num(formatClock(p.minutes))}
            </Text>
          </View>
        ))}
      </Card>
    </Sheet>
  );
}

export function TrackerSheet({
  visible,
  onClose,
  num,
  done,
  onToggle,
  nextId,
}: {
  visible: boolean;
  onClose: () => void;
  num: (v: string | number) => string;
  done: Record<string, boolean>;
  onToggle: (id: PrayerId) => void;
  nextId: PrayerId;
}) {
  const { t } = useTranslation();
  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={t('app.cardTracker')}
      closeLabel={t('app.closeSheet')}
    >
      <Card className="mb-2 overflow-hidden">
        {SAMPLE_DAY.map((p, i) => (
          <View key={p.id} className={i > 0 ? 'border-t border-border' : ''}>
            <PrayerRow
              name={t(PRAYER_KEY[p.id])}
              time={num(formatClock(p.minutes))}
              tracked={p.tracked}
              done={!!done[p.id]}
              isNext={p.id === nextId}
              doneLabel={t('home.timelineDone')}
              actionLabel={t(done[p.id] ? 'app.markUndone' : 'app.markDone', {
                name: t(PRAYER_KEY[p.id]),
              })}
              onToggle={() => onToggle(p.id)}
            />
          </View>
        ))}
      </Card>
    </Sheet>
  );
}

export function FastingSheet({
  visible,
  onClose,
  num,
}: {
  visible: boolean;
  onClose: () => void;
  num: (v: string | number) => string;
}) {
  const { t } = useTranslation();
  const [fajr, maghrib] = [SAMPLE_DAY[0], SAMPLE_DAY[4]];
  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={t('app.cardFasting')}
      closeLabel={t('app.closeSheet')}
    >
      <Card className="mb-2 overflow-hidden">
        {[
          [t('app.suhoorEnds'), fajr.minutes],
          [t('app.iftar'), maghrib.minutes],
        ].map(([label, m], i) => (
          <View
            key={String(label)}
            className={`flex-row items-center justify-between px-4 py-3 ${i > 0 ? 'border-t border-border' : ''}`}
          >
            <Text variant="lead" weight="medium">
              {label}
            </Text>
            <Text variant="lead" tabular>
              {num(formatClock(m as number))}
            </Text>
          </View>
        ))}
      </Card>
    </Sheet>
  );
}
