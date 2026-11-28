import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { NATIONAL_DAYS, SPECIAL_DAY_NAMES } from '@/features/events/content/data';
import { SAMPLE_FROM, SAMPLE_ROWS } from '@/features/events/content/sampleDays';
import {
  dayOf,
  daysBetween,
  eventsOf,
  hijriMonthOf,
  upcoming,
} from '@/features/events/data/source';
import { beadKind, beadPoint } from '@/features/events/logic/beads';
import { defaultLayers, eventName } from '@/features/events/logic/text';

const names = (ymd: string, country: string | null) =>
  eventsOf(dayOf(ymd)!, country).map((e) => (e.type === 'islamic' ? e.id : eventName(e, 'en')));

describe('sample days (made by the website code)', () => {
  it('cover whole years without a gap', () => {
    expect(SAMPLE_ROWS).toHaveLength(daysBetween(SAMPLE_FROM, '2028-12-31') + 1);
    expect(dayOf('2024-12-31')).toBeNull();
    expect(dayOf('2029-01-01')).toBeNull();
    expect(dayOf(SAMPLE_FROM)).not.toBeNull();
  });

  it('give the three dates of a day', () => {
    expect(dayOf('2026-11-29')).toMatchObject({
      hijri: { year: 1448, month: 6, day: 19 },
      bengali: { year: 1433, month: 8, day: 14 },
      islamic: [],
    });
  });

  it('name every special day they use', () => {
    const ids = new Set(
      SAMPLE_ROWS.flatMap((r) => (r.split('|')[2] ?? '').split(','))
        .filter(Boolean)
        .map((id) => id.replace(/[~*]/g, ''))
    );
    expect(ids.size).toBe(11);
    for (const id of ids) expect(Object.keys(SPECIAL_DAY_NAMES)).toContain(id);
  });
});

describe('events of a day', () => {
  it('lists yearly, then weekly, then holidays, as the website does', () => {
    expect(names('2026-03-20', 'BD')).toEqual([
      'eid_fitr',
      'friday',
      'Eid al-Fitr holiday',
      'Jumatul Bidaa',
    ]);
  });

  it('has no holidays or national days without a country', () => {
    expect(names('2026-12-16', 'BD')).toEqual(['Victory Day']);
    expect(names('2026-12-16', null)).toEqual([]);
  });

  it('keeps national days for countries without a holiday list', () => {
    expect(Object.keys(NATIONAL_DAYS).length).toBeGreaterThan(20);
    expect(names('2026-08-14', 'PK')).toContain('Independence Day');
  });
});

describe('coming up', () => {
  it('puts Islamic days first and reaches past 30 days for the next one', () => {
    const rows = upcoming('2026-11-29', 'BD');
    expect(rows[0]!.event.type).toBe('islamic');
    expect(rows[0]!.daysAway).toBeGreaterThan(30);
    expect(rows.slice(1).every((r) => r.event.type !== 'islamic' && r.daysAway <= 30)).toBe(true);
    expect(rows).toHaveLength(4);
  });

  it('does not reach further when an Islamic day is within 30 days', () => {
    const rows = upcoming('2027-02-16', null);
    expect(rows.every((r) => r.daysAway <= 30)).toBe(true);
    expect(rows.at(-1)!.event).toMatchObject({ id: 'eid_fitr' });
  });

  it('leaves out weekly and monthly days and lists the ten days once', () => {
    const ids = upcoming('2026-05-10', null).map((r) => (r.event as { id: string }).id);
    expect(ids.filter((i) => ['friday', 'fast_mon_thu', 'ayyam_al_bid'].includes(i))).toEqual([]);
    expect(ids.filter((i) => i === 'dhul_hijjah_first10')).toHaveLength(1);
  });
});

describe('month beads', () => {
  it('mark monthly and yearly days only', () => {
    const m = hijriMonthOf(dayOf('2026-11-29')!);
    expect(m.length).toBe(29);
    expect([...m.marked]).toEqual([13, 14, 15]);
  });

  it('never promise a 30th day', () => {
    expect(beadKind(30, 19)).toBe('maybe');
    expect(beadKind(30, 30)).toBe('today');
    expect(beadKind(18, 19)).toBe('past');
    expect(beadKind(20, 19)).toBe('ahead');
  });

  it('run from the start side to the end side and mirror in RTL', () => {
    expect(beadPoint(1, 100, 100, 80).x).toBeLessThan(beadPoint(30, 100, 100, 80).x);
    expect(beadPoint(1, 100, 100, 80, true).x).toBeCloseTo(beadPoint(30, 100, 100, 80).x);
  });
});

it('shows Bengali only in Bangladesh or in Bangla', () => {
  expect(defaultLayers('GB', 'en')).toEqual(['greg', 'hijri']);
  expect(defaultLayers(null, 'en')).toEqual(['greg', 'hijri']);
  expect(defaultLayers('BD', 'en')).toContain('bn');
  expect(defaultLayers('GB', 'bn')).toContain('bn');
});

it('the feature computes no Hijri date of its own', () => {
  const root = join(__dirname, '../features/events');
  const files = (dir: string): string[] =>
    readdirSync(dir).flatMap((f) => {
      const p = join(dir, f);
      return statSync(p).isDirectory() ? files(p) : [p];
    });
  for (const f of files(root))
    expect(readFileSync(f, 'utf8')).not.toMatch(/ca-islamic|umalqura['"]/);
});
