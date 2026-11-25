/** What a counter card on Home shows. */
export type CardValue =
  { kind: 'count'; value: number } | { kind: 'streak'; value: number } | { kind: 'word' };

/**
 * The one rule for the Home counter cards (owner, 2026-11-19): a count today if there is one, else the
 * running streak as a big number, else just the word.
 */
export function counterCardValue(count: number, streak: number): CardValue {
  if (count > 0) return { kind: 'count', value: count };
  if (streak > 0) return { kind: 'streak', value: streak };
  return { kind: 'word' };
}
