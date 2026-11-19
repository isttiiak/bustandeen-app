import { useState, type ReactNode } from 'react';
import { useWindowDimensions, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useTheme } from '@/theme/ThemeProvider';
import { Icon } from '@/ui/Icon';
import { PressableScale } from '@/ui/PressableScale';
import { Text } from '@/ui/Text';

import { arcFraction, arcPoint, arcSegment, labelPoint, skyBody } from '../arcGeometry';
import type { HeroInfo } from '../heroInfo';
import { SAMPLE_DAY, SAMPLE_FORBIDDEN, type PrayerId } from '../schedule';
import { NextFastRow, StatusPill } from './HeroParts';
import { Moon, Sun } from './SkyBody';

const ORDER: PrayerId[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
const minutes = (id: PrayerId) => SAMPLE_DAY.find((p) => p.id === id)!.minutes;

const DOT = 22;
const HIT = 48;
const BODY = 44;

/**
 * Layout B ("sky arc"): the day drawn as a half circle from Fajr on the left to Isha on the right.
 * Each prayer sits on the arc at its own clock time, so the gaps show the real rhythm of the day.
 * The sun rides the arc (a moon waits at the matching end at night), the current prayer's window is
 * lit in gold, forbidden times are marked in red, and each dot can be ticked right here.
 */
export function SkyHero({
  info,
  nowMinutes,
  window,
  done,
  names,
  onToggle,
  row,
}: {
  info: HeroInfo;
  nowMinutes: number;
  /** Start and end of the current prayer's time, or null in a forbidden or between-prayers moment. */
  window: { start: number; end: number } | null;
  done: Record<string, boolean>;
  names: Record<PrayerId, string>;
  onToggle: (id: PrayerId) => void;
  /** Optional prayer row (the website's five nodes) under the arc. */
  row?: ReactNode;
}) {
  const theme = useTheme();
  // Start from the screen width so the arc is drawn on the very first frame, then settle to the
  // measured width (the hero is the first thing the user sees, so it must not wait for a layout pass).
  const screenW = useWindowDimensions().width;
  const [measured, setW] = useState(0);
  const w = measured || Math.max(0, screenW - 72);
  const ink = theme.color('hero-ink');
  const gold = theme.color('hero-gold');
  const red = theme.color('hero-danger');
  const first = minutes('fajr');
  const last = minutes('isha');
  const frac = (m: number) => arcFraction(m, first, last);

  const R = Math.max(0, w / 2 - 50);
  const cx = w / 2;
  const cy = R + BODY / 2 + 6;
  const height = cy + 34;
  const body = skyBody(nowMinutes, first, last, cx, cy, R, 24);
  const full = (f1: number, f2: number) => arcSegment(f1, f2, cx, cy, R);
  const winFrom = window ? frac(Math.max(window.start, first)) : 0;
  const winTo = window ? frac(Math.min(window.end, last)) : 0;
  const reached = nowMinutes < first ? 0 : frac(nowMinutes);

  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {w > 0 ? (
        <View style={{ height }}>
          <Svg
            width={w}
            height={height}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <Path
              d={full(0, 1)}
              stroke={ink}
              strokeOpacity={0.3}
              strokeWidth={2}
              strokeDasharray="2 6"
              strokeLinecap="round"
              fill="none"
            />
            {reached > 0 ? (
              <Path
                d={full(0, reached)}
                stroke={ink}
                strokeOpacity={0.85}
                strokeWidth={3}
                strokeLinecap="round"
                fill="none"
              />
            ) : null}
            {winTo > winFrom ? (
              <Path
                d={full(winFrom, winTo)}
                stroke={gold}
                strokeWidth={5}
                strokeLinecap="round"
                fill="none"
              />
            ) : null}
            {SAMPLE_FORBIDDEN.filter(([s, e]) => s >= first && e <= last).map(([s, e]) => (
              <Path
                key={s}
                d={full(frac(s), frac(e))}
                stroke={red}
                strokeWidth={5}
                strokeLinecap="round"
                fill="none"
              />
            ))}
            {/* a small fixed tick on the horizon line under each end */}
            <Path
              d={`M ${cx - R - 18} ${cy} L ${cx + R + 18} ${cy}`}
              stroke={ink}
              strokeOpacity={0.14}
              strokeWidth={1}
            />
          </Svg>

          {ORDER.map((id) => {
            const f = frac(minutes(id));
            const p = arcPoint(f, cx, cy, R);
            const isDone = !!done[id];
            const isCurrent = info.currentId === id && info.kind === 'prayer';
            const lp = labelPoint(f, cx, cy, R, names[id].length * 6.6);
            return (
              <View key={id} pointerEvents="box-none" style={{ position: 'absolute', inset: 0 }}>
                <View
                  style={{
                    position: 'absolute',
                    left: p.x - HIT / 2,
                    top: p.y - HIT / 2,
                    width: HIT,
                    height: HIT,
                  }}
                >
                  <PressableScale
                    haptic="select"
                    onPress={() => onToggle(id)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isDone }}
                    accessibilityLabel={names[id]}
                    className="h-full w-full items-center justify-center"
                  >
                    <View
                      style={{
                        width: DOT + (isCurrent ? 8 : 0),
                        height: DOT + (isCurrent ? 8 : 0),
                        ...(isCurrent ? { borderColor: gold, borderWidth: 3 } : null),
                      }}
                      className={`items-center justify-center rounded-full ${
                        isCurrent ? 'bg-hero' : 'border border-hero-ink/50'
                      } ${isDone ? 'bg-hero-ink' : ''}`}
                    >
                      {isDone ? <Icon name="check" size={14} color="hero" /> : null}
                    </View>
                  </PressableScale>
                </View>
                <View
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    left: lp.x - 40,
                    top: lp.y - 8,
                    width: 80,
                    alignItems: 'center',
                  }}
                >
                  <Text
                    variant="caption"
                    tone={isCurrent ? 'heroGold' : 'hero'}
                    weight={isCurrent ? 'bold' : 'medium'}
                    tight
                    className={isCurrent ? 'text-center' : 'text-center opacity-80'}
                  >
                    {names[id]}
                  </Text>
                </View>
              </View>
            );
          })}

          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: body.x - BODY / 2,
              top: body.y - BODY / 2,
              width: BODY,
              height: BODY,
            }}
          >
            {body.kind === 'sun' ? <Sun size={BODY} /> : <Moon size={BODY} />}
          </View>
        </View>
      ) : null}

      <View
        accessible
        accessibilityLabel={info.spoken}
        pointerEvents="none"
        style={{ marginTop: -20 }}
        className="items-center gap-1"
      >
        <StatusPill info={info} />
        <Text variant="h1" tone="hero" className="text-center">
          {info.title}
        </Text>
        <Text variant="small" tone="hero" tabular className="text-center opacity-80">
          {info.window}
        </Text>
        <Text variant="small" tone="hero" tabular className="text-center">
          {`${info.countLabel} ${info.countdown}`}
        </Text>
      </View>
      {row}
      <NextFastRow info={info} />
    </View>
  );
}
