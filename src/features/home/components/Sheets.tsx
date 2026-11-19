import { View } from 'react-native';

import { Button } from '@/ui/Button';
import { haptic } from '@/ui/haptics';
import { Text } from '@/ui/Text';
import { Card } from '@/ui/Card';
import { Sheet } from '@/ui/Overlays';
import { PressableScale } from '@/ui/PressableScale';

import { fill, type Copy } from '../copy';
import { PrayerRow } from './PrayerRow';
import { SAMPLE_DAY, formatClock, type PrayerId } from '../schedule';

export function TimesSheet({
  visible,
  onClose,
  c,
  num,
  nextId,
}: {
  visible: boolean;
  onClose: () => void;
  c: Copy;
  num: (v: string | number) => string;
  nextId: PrayerId;
}) {
  return (
    <Sheet visible={visible} onClose={onClose} title={c.cardTimes} closeLabel={c.closeSheet}>
      <Card className="mb-2 overflow-hidden">
        {SAMPLE_DAY.map((p, i) => (
          <View
            key={p.id}
            className={`flex-row items-center justify-between px-4 py-3 ${i > 0 ? 'border-t border-border' : ''} ${
              p.id === nextId ? 'bg-emerald/10' : ''
            }`}
          >
            <Text variant="lead" weight={p.id === nextId ? 'bold' : 'medium'}>
              {c[p.id]}
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
  c,
  num,
  done,
  onToggle,
  nextId,
}: {
  visible: boolean;
  onClose: () => void;
  c: Copy;
  num: (v: string | number) => string;
  done: Record<string, boolean>;
  onToggle: (id: PrayerId) => void;
  nextId: PrayerId;
}) {
  return (
    <Sheet visible={visible} onClose={onClose} title={c.cardTracker} closeLabel={c.closeSheet}>
      <Card className="mb-2 overflow-hidden">
        {SAMPLE_DAY.map((p, i) => (
          <View key={p.id} className={i > 0 ? 'border-t border-border' : ''}>
            <PrayerRow
              name={c[p.id]}
              time={num(formatClock(p.minutes))}
              tracked={p.tracked}
              done={!!done[p.id]}
              isNext={p.id === nextId}
              doneLabel={c.done}
              actionLabel={fill(done[p.id] ? c.markUndone : c.markDone, { name: c[p.id] })}
              onToggle={() => onToggle(p.id)}
            />
          </View>
        ))}
      </Card>
    </Sheet>
  );
}

export function ZikrSheet({
  visible,
  onClose,
  c,
  num,
  count,
  setCount,
}: {
  visible: boolean;
  onClose: () => void;
  c: Copy;
  num: (v: string | number) => string;
  count: number;
  setCount: (n: number) => void;
}) {
  return (
    <Sheet visible={visible} onClose={onClose} title={c.cardZikr} closeLabel={c.closeSheet}>
      <View className="items-center gap-4 pb-2">
        <PressableScale
          onPress={() => {
            const next = count + 1;
            setCount(next);
            haptic(next % 33 === 0 ? 'success' : 'tick');
          }}
          accessibilityRole="button"
          accessibilityLabel={`${c.tapToCount}: ${num(count)}`}
          className="h-52 w-52 items-center justify-center rounded-full border-2 border-gold bg-hero"
        >
          <Text variant="display" tone="hero" tabular style={{ fontSize: 56, lineHeight: 64 }}>
            {num(count)}
          </Text>
          <Text variant="small" tone="hero" className="opacity-70">
            {c.tapToCount}
          </Text>
        </PressableScale>
        <Button label={c.resetCount} variant="secondary" onPress={() => setCount(0)} />
      </View>
    </Sheet>
  );
}

export function FastingSheet({
  visible,
  onClose,
  c,
  num,
}: {
  visible: boolean;
  onClose: () => void;
  c: Copy;
  num: (v: string | number) => string;
}) {
  const [fajr, maghrib] = [SAMPLE_DAY[0], SAMPLE_DAY[4]];
  return (
    <Sheet visible={visible} onClose={onClose} title={c.cardFasting} closeLabel={c.closeSheet}>
      <Card className="mb-2 overflow-hidden">
        {[
          [c.suhoorEnds, fajr.minutes],
          [c.iftar, maghrib.minutes],
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
