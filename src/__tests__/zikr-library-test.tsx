import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { setLang } from '@/features/settings/langStore';
import { ZikrLibraryScreen } from '@/features/zikr/screens/ZikrLibraryScreen';
import { zikrStore } from '@/features/zikr/store';
import { ToastProvider } from '@/ui/Overlays';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning' },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), canGoBack: () => true, replace: jest.fn() }),
}));

jest.mock('@/features/zikr/data/sqlite', () => ({
  openZikrDatabase: async () => {
    const helpers = jest.requireActual('../../jest/sqlite');
    return helpers.runner(await helpers.openMigrated());
  },
}));

async function renderLibrary() {
  await render(
    <ToastProvider>
      <ZikrLibraryScreen />
    </ToastProvider>
  );
  await act(async () => {
    await zikrStore().start();
  });
}

describe('Zikr library', () => {
  it('lists the categories and adds a zikr to the list', async () => {
    setLang('en');
    await renderLibrary();
    expect(screen.getAllByText('Tasbīḥ & praise').length).toBeGreaterThan(0);
    // Built-in zikr already in the list show as such.
    expect(screen.getAllByText('In your list').length).toBeGreaterThan(0);

    await fireEvent.press(screen.getByTestId('library-add-SubhanAllahil-Azim wa bihamdihi'));
    expect(zikrStore().get().list.at(-1)).toBe('SubhanAllahil-Azim wa bihamdihi');
    expect(
      screen.getByText('"SubhanAllahil-Azim wa bihamdihi" added to your counter')
    ).toBeOnTheScreen();
    expect(screen.queryByTestId('library-add-SubhanAllahil-Azim wa bihamdihi')).toBeNull();
  });

  it('shows Bangla titles and meanings in Bangla', async () => {
    await act(async () => setLang('bn'));
    await renderLibrary();
    expect(screen.getAllByText('তাসবীহ ও প্রশংসা').length).toBeGreaterThan(0);
    await act(async () => setLang('en'));
  });
});
