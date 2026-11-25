import { PREDEFINED_TYPES, isCore, isKnownZikr, isPredefined, sameZikrName } from '../content';

// The user's zikr list (web `pages/ZikrCounter.tsx` and `utils/hiddenZikr.ts`): the built-in zikr in
// order, minus the ones the user removed (core ones always stay), then the ones added from the library.
// Removed built-ins live under the web's own key `bustandeen_zikr_hidden`. Library additions are server
// zikr types on the web; here they stay on the phone until zikr sync sends them (D20).

export interface ListState {
  /** Built-in zikr the user removed. */
  hidden: readonly string[];
  /** Library zikr the user added, in the order added. */
  added: readonly string[];
}

/** Reads a stored JSON array of names; anything else is an empty list. */
export function parseNames(raw: string | undefined): string[] {
  try {
    const v = JSON.parse(raw ?? '[]') as unknown;
    return Array.isArray(v)
      ? v.filter((n): n is string => typeof n === 'string' && !!n.trim())
      : [];
  } catch {
    return [];
  }
}

const has = (list: readonly string[], name: string) => list.some((n) => sameZikrName(n, name));

export function myList({ hidden, added }: ListState): string[] {
  const out: string[] = PREDEFINED_TYPES.filter((n) => isCore(n) || !has(hidden, n));
  for (const n of added) {
    if (isKnownZikr(n) && !isPredefined(n) && !has(out, n)) out.push(n);
  }
  return out;
}

export function inList(state: ListState, name: string): boolean {
  return has(myList(state), name);
}

/** Adds a zikr (a removed built-in comes back). Unknown names are ignored. */
export function addZikr(state: ListState, name: string): ListState {
  if (!isKnownZikr(name) || inList(state, name)) return state;
  if (isPredefined(name)) {
    return { ...state, hidden: state.hidden.filter((n) => !sameZikrName(n, name)) };
  }
  return { ...state, added: [...state.added, name] };
}

/** Removes a zikr from the list; core zikr cannot be removed (returns the state unchanged). */
export function removeZikr(state: ListState, name: string): ListState {
  if (isCore(name) || !inList(state, name)) return state;
  if (isPredefined(name)) {
    const canonical = PREDEFINED_TYPES.find((p) => sameZikrName(p, name)) ?? name;
    return { ...state, hidden: [...state.hidden, canonical] };
  }
  return { ...state, added: state.added.filter((n) => !sameZikrName(n, name)) };
}
