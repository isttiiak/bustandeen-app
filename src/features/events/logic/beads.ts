// Geometry of the month arch: 30 beads on an arc, the 1st at the start side and the 30th at the end side.

export const BEADS = 30;
// The ends stop above the month name, also at font scale 1.5.
const FIRST_DEG = 152;
const LAST_DEG = 28;

export type BeadKind = 'past' | 'today' | 'ahead' | 'maybe';

/** Centre of the bead for day 1-30. `rtl` mirrors the arc. */
export function beadPoint(
  day: number,
  cx: number,
  cy: number,
  r: number,
  rtl = false
): { x: number; y: number } {
  const deg = FIRST_DEG - ((FIRST_DEG - LAST_DEG) * (day - 1)) / (BEADS - 1);
  const a = (deg * Math.PI) / 180;
  const dx = r * Math.cos(a);
  return { x: cx + (rtl ? -dx : dx), y: cy - r * Math.sin(a) };
}

/** A 30th day is never certain ahead of time, so it stays `maybe` until it is today. */
export function beadKind(day: number, today: number): BeadKind {
  if (day === today) return 'today';
  if (day === BEADS) return 'maybe';
  return day < today ? 'past' : 'ahead';
}
