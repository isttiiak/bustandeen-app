import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { MoreScreen } from '@/features/settings/screens/MoreScreen';
import { setLang } from '@/features/settings/langStore';
import { zikrStore } from '@/features/zikr/store';
import { kv } from '@/lib/kv';
import { PREF_KEYS } from '@/lib/prefs';
import { uiPrefs } from '@/lib/uiPrefs';
import { hapticsEnabled } from '@/ui/haptics';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning' },
}));

// The zikr store over Node's SQLite with the real migrations (the phone uses SQLCipher).
jest.mock('@/features/zikr/data/sqlite', () => ({
  openZikrDatabase: async () => {
    const helpers = jest.requireActual('../../jest/sqlite');
    return helpers.runner(await helpers.openMigrated());
  },
}));

async function renderSettings() {
  await render(<MoreScreen />);
  await act(async () => {
    await zikrStore().start();
  });
}

describe('Settings', () => {
  beforeAll(() => setLang('en'));

  it('shows the sections that work today', async () => {
    await renderSettings();
    for (const title of ['Appearance', 'Language', 'Zikr', 'Accessibility']) {
      expect(screen.getByText(title)).toBeOnTheScreen();
    }
    expect(screen.getByRole('button', { name: 'Daily target: 100' })).toBeOnTheScreen();
  });

  it('turns every haptic off and on, saved under the web key', async () => {
    await renderSettings();
    const toggle = screen.getByRole('switch', { name: 'Vibration feedback' });
    await fireEvent(toggle, 'valueChange', false);
    expect(hapticsEnabled()).toBe(false);
    expect(kv.getString(PREF_KEYS.vibration)).toBe('0');
    await fireEvent(toggle, 'valueChange', true);
    expect(hapticsEnabled()).toBe(true);
    expect(kv.getString(PREF_KEYS.vibration)).toBe('1');
  });

  it('saves the reduce animations choice under the web key', async () => {
    await renderSettings();
    // The dev-only design review further down has its own On/Off; Accessibility comes first.
    await fireEvent.press(screen.getAllByRole('radio', { name: 'On' })[0]!);
    expect(uiPrefs.get().reduceMotion).toBe('on');
    expect(kv.getString(PREF_KEYS.reduceMotion)).toBe('on');
    await fireEvent.press(screen.getByRole('radio', { name: 'Auto' }));
    expect(kv.getString(PREF_KEYS.reduceMotion)).toBe('auto');
  });

  it('sets the daily zikr goal and grace days, and refuses an out-of-range number', async () => {
    await renderSettings();
    await fireEvent.press(screen.getByTestId('settings-goal'));
    await fireEvent.changeText(screen.getByTestId('goal-input'), '0');
    await fireEvent.press(screen.getByTestId('goal-save'));
    expect(screen.getByText('From 1 to 100000')).toBeOnTheScreen();
    expect(zikrStore().get().goal.dailyTarget).toBe(100);

    await fireEvent.changeText(screen.getByTestId('goal-input'), '');
    await fireEvent.press(screen.getByTestId('goal-300'));
    await fireEvent.press(screen.getByRole('radio', { name: '2' }));
    await fireEvent.press(screen.getByTestId('goal-save'));
    expect(zikrStore().get().goal).toEqual({ dailyTarget: 300, graceDays: 2 });
    expect(screen.getByRole('button', { name: 'Daily target: 300' })).toBeOnTheScreen();
  });
});
