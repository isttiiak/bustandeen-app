import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { useTheme } from '@/theme/ThemeProvider';
import { Icon } from '@/ui/Icon';
import { PressableScale } from '@/ui/PressableScale';
import { Text } from '@/ui/Text';

import type { Copy } from '../copy';
import type { HeroInfo } from '../heroInfo';
import { SAMPLE_DAY, type PrayerId } from '../schedule';
import { NextFastRow, StatusPill } from './HeroParts';

const ORDER: PrayerId[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
const minutes = (id: PrayerId) => SAMPLE_DAY.find((p) => p.id === id)!.minutes;

/**
 * Layout B ("sky arc"): the day drawn as a horizon, Fajr on the left to Isha on the right, with the
 * sun moving along it and each prayer a dot that fills when it is done. The current prayer sits under
 * the arc and the five prayers can be ticked right here, so the first screen is also the tracker.
 */
export function SkyHero({
  info,
  c,
  nowMinutes,
  done,
  names,
  onToggle,
}: {
  info: HeroInfo;
  c: Copy;
  nowMinutes: number;
  done: Record<string, boolean>;
  names: Record<PrayerId, string>;
  onToggle: (id: PrayerId) => void;
}) {
  const theme = useTheme();
  const [w, setW] = useState(0);
  const ink = theme.color('hero-ink');
  const first = minutes('fajr');
  const last = minutes('isha');
  const frac = (m: number) => Math.min(1, Math.max(0, (m - first) / (last - first)));

  const R = Math.max(0, w / 2 - 28);
  const cx = w / 2;
  const cy = R + 22;
  const pt = (f: number) => ({
    x: cx - R * Math.cos(f * Math.PI),
    y: cy - R * Math.sin(f * Math.PI),
  });
  const sun = pt(frac(nowMinutes));
  const arcLen = Math.PI * R;

  return (
    <View
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      className="overflow-hidden rounded-[28px] border border-border bg-hero px-4 pb-4 pt-3"
    >
      <View accessible accessibilityLabel={info.spoken}>
        {w > 0 ? (
          <View style={{ height: cy + 14 }}>
            <Svg width={w - 32} height={cy + 14} viewBox={`16 0 ${w - 32} ${cy + 14}`}>
              <Path
                d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
                stroke={ink}
                strokeOpacity={0.22}
                strokeWidth={2}
                strokeDasharray="2 6"
                strokeLinecap="round"
                fill="none"
              />
              <Path
                d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
                stroke={ink}
                strokeOpacity={0.9}
                strokeWidth={3}
                strokeLinecap="round"
                strokeDasharray={`${arcLen * frac(nowMinutes)} ${arcLen}`}
                fill="none"
              />
              {ORDER.map((id) => {
                const p = pt(frac(minutes(id)));
                return (
                  <Circle
                    key={id}
                    cx={p.x}
                    cy={p.y}
                    r={5}
                    fill={done[id] ? ink : 'transparent'}
                    stroke={ink}
                    strokeWidth={1.5}
                  />
                );
              })}
              <Circle cx={sun.x} cy={sun.y} r={13} fill={ink} fillOpacity={0.18} />
              <Circle cx={sun.x} cy={sun.y} r={7} fill={ink} />
            </Svg>
            <View
              className="absolute inset-x-0 items-center gap-1"
              style={{ bottom: 6, paddingHorizontal: Math.max(24, R * 0.25) }}
            >
              <StatusPill info={info} />
              <Text variant="h1" tone="hero" className="text-center">
                {info.title}
              </Text>
              <Text variant="small" tone="hero" tabular className="text-center opacity-80">
                {`${info.window}  ·  ${info.countLabel} ${info.countdown}`}
              </Text>
            </View>
          </View>
        ) : null}
        <NextFastRow info={info} c={c} />
      </View>

      <View className="mt-3 flex-row justify-between border-t border-hero-ink/15 pt-2">
        {ORDER.map((id) => (
          <PressableScale
            key={id}
            haptic="select"
            onPress={() => onToggle(id)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: !!done[id] }}
            accessibilityLabel={names[id]}
            className="min-h-14 flex-1 items-center justify-center gap-1"
          >
            <View
              className={`h-7 w-7 items-center justify-center rounded-full border ${
                done[id] ? 'border-hero-ink bg-hero-ink' : 'border-hero-ink/40'
              }`}
            >
              {done[id] ? <Icon name="check" size={16} color="hero" /> : null}
            </View>
            <Text variant="caption" tone="hero" tight className="text-center">
              {names[id]}
            </Text>
          </PressableScale>
        ))}
      </View>
    </View>
  );
}
