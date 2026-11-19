import { arcFraction, arcPoint, labelPoint, skyBody } from '@/features/home/arcGeometry';
import { segmentFill } from '@/features/home/components/PrayerTimeline';
import { SAMPLE_DAY } from '@/features/home/schedule';

const at = (id: string) => SAMPLE_DAY.find((p) => p.id === id)!.minutes;
const first = at('fajr');
const last = at('isha');

describe('sky arc geometry (sample times)', () => {
  it('maps Fajr to the left end and Isha to the right end', () => {
    expect(arcFraction(first, first, last)).toBe(0);
    expect(arcFraction(last, first, last)).toBe(1);
    expect(arcFraction(0, first, last)).toBe(0);
    expect(arcFraction(23 * 60, first, last)).toBe(1);
    const left = arcPoint(0, 100, 100, 80);
    const right = arcPoint(1, 100, 100, 80);
    expect(left.x).toBeCloseTo(20);
    expect(left.y).toBeCloseTo(100);
    expect(right.x).toBeCloseTo(180);
    expect(arcPoint(0.5, 100, 100, 80).y).toBeCloseTo(20); // top of the arc
  });

  it('places the prayers in order by their clock time, not evenly', () => {
    const f = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].map((id) =>
      arcFraction(at(id), first, last)
    );
    expect([...f].sort((a, b) => a - b)).toEqual(f);
    // Dhuhr is about half way through the Fajr to Isha span; Maghrib and Isha are close together.
    expect(f[1]).toBeGreaterThan(0.45);
    expect(f[1]).toBeLessThan(0.55);
    expect(f[4] - f[3]).toBeLessThan(0.12);
  });

  it('keeps the sun on the arc by day and the moon outside it at night', () => {
    const day = skyBody(13 * 60, first, last, 100, 100, 80);
    expect(day.kind).toBe('sun');
    expect(Math.hypot(day.x - 100, day.y - 100)).toBeCloseTo(80);
    const before = skyBody(first - 30, first, last, 100, 100, 80, 24);
    const after = skyBody(last + 30, first, last, 100, 100, 80, 24);
    expect(before).toEqual({ kind: 'moon', x: -4, y: 100 });
    expect(after).toEqual({ kind: 'moon', x: 204, y: 100 });
  });

  it('puts the labels of the two end dots below the horizon and others inside the circle', () => {
    expect(labelPoint(0, 100, 100, 80, 30).y).toBeGreaterThan(100);
    expect(labelPoint(1, 100, 100, 80, 30).y).toBeGreaterThan(100);
    const mid = labelPoint(0.5, 100, 100, 80, 30);
    expect(mid.y).toBeGreaterThan(20); // below the dot at the top
    expect(Math.hypot(mid.x - 100, mid.y - 100)).toBeLessThan(80);
  });
});

describe('prayer timeline line', () => {
  it('fills between two prayers as the clock moves', () => {
    expect(segmentFill(at('dhuhr') - 10, at('dhuhr'), at('asr'))).toBe(0);
    expect(segmentFill(at('asr') + 10, at('dhuhr'), at('asr'))).toBe(1);
    const mid = segmentFill((at('dhuhr') + at('asr')) / 2, at('dhuhr'), at('asr'));
    expect(mid).toBeCloseTo(0.5);
  });
});
