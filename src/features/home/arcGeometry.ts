// Geometry of the Layout B sky arc: the half circle runs from Fajr (left end) to Isha (right end) and
// every prayer sits on it at its own clock time. Pure functions, so the placement is easy to test.

export interface ArcPoint {
  x: number;
  y: number;
}

/** 0 at `first`, 1 at `last`, clamped. Times are minutes after midnight. */
export function arcFraction(minutes: number, first: number, last: number): number {
  if (last <= first) return 0;
  return Math.min(1, Math.max(0, (minutes - first) / (last - first)));
}

/** Point on the half circle of radius `r` centred at (`cx`, `cy`) for a fraction `f` (0 = left end,
 *  1 = right end, 0.5 = top). */
export function arcPoint(f: number, cx: number, cy: number, r: number): ArcPoint {
  return { x: cx - r * Math.cos(f * Math.PI), y: cy - r * Math.sin(f * Math.PI) };
}

/** SVG path for the part of the arc between two fractions (left to right). */
export function arcSegment(f1: number, f2: number, cx: number, cy: number, r: number): string {
  const a = arcPoint(f1, cx, cy, r);
  const b = arcPoint(f2, cx, cy, r);
  return `M ${a.x} ${a.y} A ${r} ${r} 0 ${(f2 - f1) * 180 > 180 ? 1 : 0} 1 ${b.x} ${b.y}`;
}

/** Where a label goes: from the dot towards the centre of the circle, far enough that the text clears
 *  the dot. Dots at the two ends sit on the horizon, so their label goes straight below. */
export function labelPoint(
  f: number,
  cx: number,
  cy: number,
  r: number,
  textWidth: number,
  gap = 16
): ArcPoint {
  const p = arcPoint(f, cx, cy, r);
  if (f < 0.04 || f > 0.96) return { x: p.x, y: p.y + gap + 8 };
  const ux = (cx - p.x) / r;
  const uy = (cy - p.y) / r;
  const d = gap + (textWidth / 2) * Math.abs(ux) + 6 * Math.abs(uy);
  return { x: p.x + ux * d, y: p.y + uy * d };
}

/** Where the sun, or at night the moon, is drawn. During the day the sun rides the arc; before Fajr
 *  and after Isha the moon waits just outside the matching end of the arc, on the horizon. */
export function skyBody(
  minutes: number,
  first: number,
  last: number,
  cx: number,
  cy: number,
  r: number,
  outside = 26
): { kind: 'sun' | 'moon'; x: number; y: number } {
  if (minutes < first) return { kind: 'moon', x: cx - r - outside, y: cy };
  if (minutes > last) return { kind: 'moon', x: cx + r + outside, y: cy };
  const p = arcPoint(arcFraction(minutes, first, last), cx, cy, r);
  return { kind: 'sun', x: p.x, y: p.y };
}
