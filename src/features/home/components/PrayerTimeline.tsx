import { View } from 'react-native';

import { Icon } from '@/ui/Icon';
import { PressableScale } from '@/ui/PressableScale';
import { Text } from '@/ui/Text';

import { SAMPLE_DAY, type PrayerId } from '../schedule';

const ORDER: PrayerId[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
const NODE = 28;

/** How far along the stretch between two prayers the clock is, 0 to 1. */
export function segmentFill(now: number, from: number, to: number): number {
  if (to <= from) return 0;
  return Math.min(1, Math.max(0, (now - from) / (to - from)));
}

/**
 * Layout A: the five prayers as a row of nodes joined by a line. Done prayers are filled with a
 * check, the current one has a gold ring, and the line fills as the day moves from one to the next.
 * Each node is a button, so the first screen is also a quick tracker.
 */
export function PrayerTimeline({
  nowMinutes,
  currentId,
  done,
  names,
  onToggle,
}: {
  nowMinutes: number;
  currentId: PrayerId | null;
  done: Record<string, boolean>;
  names: Record<PrayerId, string>;
  onToggle: (id: PrayerId) => void;
}) {
  const at = (id: PrayerId) => SAMPLE_DAY.find((p) => p.id === id)!.minutes;
  return (
    <View className="mt-3 w-full">
      <View className="w-full">
        <View className="absolute inset-x-0 top-0" style={{ height: 48 }} pointerEvents="none">
          {ORDER.slice(0, -1).map((id, i) => {
            const fill = segmentFill(nowMinutes, at(id), at(ORDER[i + 1]));
            return (
              <View
                key={id}
                className="absolute h-0.5 overflow-hidden rounded-full bg-hero-ink/20"
                style={{ left: `${(i + 0.5) * 20}%`, width: '20%', top: 23 }}
              >
                <View
                  className="h-full bg-hero-ink"
                  style={{ width: `${Math.round(fill * 100)}%` }}
                />
              </View>
            );
          })}
        </View>
        <View className="flex-row">
          {ORDER.map((id) => {
            const isDone = !!done[id];
            const isCurrent = currentId === id;
            return (
              <View key={id} className="flex-1 items-center">
                <PressableScale
                  haptic="select"
                  onPress={() => onToggle(id)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isDone }}
                  accessibilityLabel={names[id]}
                  className="min-h-14 w-full items-center gap-1"
                >
                  <View style={{ height: 48 }} className="items-center justify-center">
                    <View
                      className={`items-center justify-center rounded-full ${
                        isCurrent ? 'border-2 border-hero-gold' : ''
                      }`}
                      style={{ width: NODE + 8, height: NODE + 8 }}
                    >
                      <View
                        className={`items-center justify-center rounded-full border ${
                          isDone ? 'border-hero-ink bg-hero-ink' : 'border-hero-ink/40 bg-hero'
                        }`}
                        style={{ width: NODE - 4, height: NODE - 4 }}
                      >
                        {isDone ? <Icon name="check" size={15} color="hero" /> : null}
                      </View>
                    </View>
                  </View>
                  <Text
                    variant="caption"
                    tone={isCurrent ? 'heroGold' : 'hero'}
                    weight={isCurrent ? 'bold' : 'medium'}
                    tight
                    className={isCurrent ? 'text-center' : 'text-center opacity-80'}
                  >
                    {names[id]}
                  </Text>
                </PressableScale>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
