// The day a zikr tap belongs to.
//
// TODO(core): replace `zikrToday` with `getTrackingDay()` from `@bustandeen/core` once core is synced
// (task P2-08), and `addDays` with core's `addDaysYmd`. CLAUDE.md rule 5: every "today" comes from
// `getTrackingDay()`. Until then this is the phone's calendar date, which is exactly what the web's
// `getTrackingDay()` returns for a person with no saved location (web `frontend/src/utils/trackingDay.ts`
// falls back to civil midnight). No new day rule is invented here: the Fajr and Maghrib boundaries
// arrive with core and the saved place. All zikr code reads the day through this file only.

/** YYYY-MM-DD of `now` in the phone's time zone. */
export function zikrToday(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** The YYYY-MM-DD `delta` days after `day` (calendar arithmetic, no time zone involved). */
export function addDays(day: string, delta: number): string {
  const [y, m, d] = day.split('-').map(Number);
  const dt = new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1));
  dt.setUTCDate(dt.getUTCDate() + delta);
  return dt.toISOString().slice(0, 10);
}
