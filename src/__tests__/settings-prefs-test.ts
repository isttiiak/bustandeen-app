import { DEFAULT_GOAL, isValidTarget, parseGoal, reachesGoal } from '@/features/zikr/logic/goal';
import { PREF_KEYS, type PrefStore } from '@/lib/prefs';
import {
  createUiPrefs,
  effectiveReduceMotion,
  parseReduceMotionMode,
  parseVibration,
} from '@/lib/uiPrefs';

function memoryPrefs(
  initial: Record<string, string> = {}
): PrefStore & { data: Map<string, string> } {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getString: (k) => data.get(k),
    setString: (k, v) => void data.set(k, v),
    remove: (k) => void data.delete(k),
  };
}

describe('reduce motion (web rule)', () => {
  it('reads the stored mode like the web, an old "1" meaning on', () => {
    expect(parseReduceMotionMode('on')).toBe('on');
    expect(parseReduceMotionMode('1')).toBe('on');
    expect(parseReduceMotionMode('off')).toBe('off');
    expect(parseReduceMotionMode('0')).toBe('auto');
    expect(parseReduceMotionMode(undefined)).toBe('auto');
  });

  it('auto follows the phone, on and off override it', () => {
    expect(effectiveReduceMotion('auto', true)).toBe(true);
    expect(effectiveReduceMotion('auto', false)).toBe(false);
    expect(effectiveReduceMotion('on', false)).toBe(true);
    expect(effectiveReduceMotion('off', true)).toBe(false);
  });
});

describe('vibration (web rule)', () => {
  it('is on unless "0" was saved', () => {
    expect(parseVibration(undefined)).toBe(true);
    expect(parseVibration('1')).toBe(true);
    expect(parseVibration('0')).toBe(false);
  });
});

describe('ui prefs store', () => {
  it('saves under the web keys and values and tells listeners', () => {
    const store = memoryPrefs({ [PREF_KEYS.reduceMotion]: '1' });
    const prefs = createUiPrefs(store);
    expect(prefs.get()).toEqual({ reduceMotion: 'on', vibration: true });
    const seen: unknown[] = [];
    prefs.subscribe(() => seen.push(prefs.get()));
    prefs.setVibration(false);
    prefs.setReduceMotion('off');
    expect(store.data.get(PREF_KEYS.vibration)).toBe('0');
    expect(store.data.get(PREF_KEYS.reduceMotion)).toBe('off');
    expect(seen).toEqual([
      { reduceMotion: 'on', vibration: false },
      { reduceMotion: 'off', vibration: false },
    ]);
  });
});

describe('zikr goal (server limits: 1 to 100000, grace 0 to 3)', () => {
  it('falls back to the server defaults for missing or bad values', () => {
    expect(DEFAULT_GOAL).toEqual({ dailyTarget: 100, graceDays: 1 });
    expect(parseGoal(undefined)).toEqual(DEFAULT_GOAL);
    expect(parseGoal('not json')).toEqual(DEFAULT_GOAL);
    expect(parseGoal('{"dailyTarget":0,"graceDays":5}')).toEqual(DEFAULT_GOAL);
    expect(parseGoal('{"dailyTarget":300,"graceDays":0}')).toEqual({
      dailyTarget: 300,
      graceDays: 0,
    });
  });

  it('validates the target and spots the tap that reaches it', () => {
    expect([1, 100000].map(isValidTarget)).toEqual([true, true]);
    expect([0, 100001, 2.5].map(isValidTarget)).toEqual([false, false, false]);
    expect(reachesGoal(32, 33, 33)).toBe(true);
    expect(reachesGoal(33, 34, 33)).toBe(false);
    expect(reachesGoal(10, 11, 33)).toBe(false);
  });
});
