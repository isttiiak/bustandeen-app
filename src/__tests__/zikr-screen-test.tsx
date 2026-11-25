import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { useEffect as mockUseEffect } from 'react';

import * as Haptics from 'expo-haptics';

import { setLang } from '@/features/settings/langStore';
import { ZikrCounterScreen } from '@/features/zikr/screens/ZikrCounterScreen';
import { zikrStore } from '@/features/zikr/store';
import { ToastProvider } from '@/ui/Overlays';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning' },
}));

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), canGoBack: () => true, replace: jest.fn(), push: mockPush }),
  useFocusEffect: (effect: () => void) => mockUseEffect(effect, [effect]),
}));

// The app's store over Node's SQLite with the real migrations (the phone uses SQLCipher).
jest.mock('@/features/zikr/data/sqlite', () => ({
  openZikrDatabase: async () => {
    const helpers = jest.requireActual('../../jest/sqlite');
    return helpers.runner(await helpers.openMigrated());
  },
}));

async function renderCounter() {
  await render(
    <ToastProvider>
      <ZikrCounterScreen />
    </ToastProvider>
  );
  await act(async () => {
    await zikrStore().start();
  });
  // The dial draws once it knows its size.
  await act(async () => {
    await fireEvent(screen.getByTestId('zikr-tap-area'), 'layout', {
      nativeEvent: { layout: { width: 360, height: 400 } },
    });
  });
}

const tap = async () => {
  await fireEvent.press(screen.getByTestId('zikr-tap-area'));
};

describe('Zikr counter screen', () => {
  beforeAll(() => {
    setLang('en');
  });

  it('shows the zikr from the web content and counts on tap', async () => {
    await renderCounter();
    expect(screen.getByText('Subḥāna-llāh')).toBeOnTheScreen();
    expect(
      screen.getByText('Glory be to Allah: praising His perfection above all imperfections')
    ).toBeOnTheScreen();
    for (let i = 0; i < 3; i++) await tap();
    expect(screen.getByText('Today 3')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Undo' }));
    expect(screen.getByText('Today 2')).toBeOnTheScreen();
  });

  it('counts down to a target and marks the set complete', async () => {
    await renderCounter();
    await act(async () => zikrStore().setTarget(33));
    for (let i = 0; i < 32; i++) await tap();
    expect(screen.getByText('1')).toBeOnTheScreen();
    expect(screen.getByText('left')).toBeOnTheScreen();
    await tap();
    expect(screen.getAllByText('33 done, set complete').length).toBeGreaterThan(0);
    await tap();
    expect(screen.getByText('32')).toBeOnTheScreen(); // a new set began
    await act(async () => zikrStore().setTarget(null));
  });

  it('asks before a reset and keeps today’s count', async () => {
    await renderCounter();
    await act(async () => zikrStore().select('Alhamdulillah'));
    for (let i = 0; i < 4; i++) await tap();
    await fireEvent.press(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByText('Reset Alhamdulillah counter?')).toBeOnTheScreen();
    expect(
      screen.getByText("The counter goes back to 0. Today's count of 4 stays.")
    ).toBeOnTheScreen();
    const resetButtons = screen.getAllByRole('button', { name: 'Reset' });
    await fireEvent.press(resetButtons[resetButtons.length - 1]!);
    expect(zikrStore().get().rows.Alhamdulillah).toEqual({ count: 4, shown: 0 });
  });

  it('labels the controls for screen readers', async () => {
    await renderCounter();
    expect(screen.getByRole('button', { name: 'Back' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'No target' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: /^Count: / })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: /, Change…$/ })).toBeOnTheScreen();
  });

  it('gives a haptic for each kind of action, and none when there is nothing to undo', async () => {
    await renderCounter();
    await act(async () => zikrStore().select('La ilaha illallah'));
    const light = () =>
      (Haptics.impactAsync as jest.Mock).mock.calls.filter((c) => c[0] === 'light').length;
    const medium = () =>
      (Haptics.impactAsync as jest.Mock).mock.calls.filter((c) => c[0] === 'medium').length;
    jest.clearAllMocks();

    // Undo with nothing on the counter: no haptic (doc 06: none for errors), only a nudge.
    await fireEvent.press(screen.getByRole('button', { name: 'Undo' }));
    expect(Haptics.selectionAsync).not.toHaveBeenCalled();

    for (let i = 0; i < 32; i++) await tap();
    expect(light()).toBeGreaterThanOrEqual(32);
    const mediumBefore = medium();
    await tap(); // the 33rd: milestone without a target
    expect(medium()).toBe(mediumBefore + 1);

    await fireEvent.press(screen.getByRole('button', { name: 'Undo' }));
    expect(Haptics.selectionAsync).toHaveBeenCalled();
  });

  it('marks the moment today first reaches the daily goal of 100', async () => {
    await renderCounter();
    const before = zikrStore().get().todayTotal;
    jest.clearAllMocks();
    for (let i = before; i < 99; i++) await tap();
    expect(Haptics.notificationAsync).not.toHaveBeenCalled();
    await tap(); // the 100th of the day
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
    expect(screen.getByText('Daily goal reached')).toBeOnTheScreen();
    jest.clearAllMocks();
    await tap(); // only once a day
    expect(Haptics.notificationAsync).not.toHaveBeenCalled();
  });

  it('picks a zikr from My zikr list and opens the library from it', async () => {
    await renderCounter();
    await fireEvent.press(screen.getByTestId('zikr-picker'));
    expect(screen.getByText('My zikr list')).toBeOnTheScreen();
    expect(screen.getAllByRole('radio').length).toBeGreaterThanOrEqual(11);
    await fireEvent.press(screen.getByTestId('zikr-option-Durud Ibrahim'));
    expect(zikrStore().get().selected).toBe('Durud Ibrahim');

    await fireEvent.press(screen.getByTestId('zikr-picker'));
    await fireEvent.press(screen.getByTestId('zikr-open-library'));
    expect(mockPush).toHaveBeenCalledWith('/zikr/library');
  });

  it('removes a zikr after a confirm; core zikr are always on', async () => {
    await renderCounter();
    await fireEvent.press(screen.getByTestId('zikr-picker'));
    await fireEvent.press(screen.getByRole('button', { name: 'Edit' }));
    expect(screen.getAllByText('Always on')).toHaveLength(6);
    await fireEvent.press(screen.getByRole('button', { name: 'Remove Durud Ibrahim' }));
    expect(screen.getByText('Remove "Durud Ibrahim"?')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Yes, remove' }));
    expect(zikrStore().get().list).not.toContain('Durud Ibrahim');
    expect(zikrStore().get().selected).toBe('SubhanAllah');
  });
});
