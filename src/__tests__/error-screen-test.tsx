import { fireEvent, render, screen } from '@testing-library/react-native';

import { ErrorScreen } from '@/features/errors/ErrorScreen';
import { setLang } from '@/features/settings/langStore';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning' },
}));

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSegments: () => [],
}));

describe('Error screen', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => jest.restoreAllMocks());

  it('shows the web wording; Reload draws again, Go to Home leaves', async () => {
    setLang('en');
    const retry = jest.fn(() => Promise.resolve());
    await render(<ErrorScreen error={new Error('boom')} retry={retry} />);
    expect(screen.getByText('Something went wrong')).toBeOnTheScreen();
    expect(
      screen.getByText(
        'An unexpected error interrupted the app. Your worship data is safe. Try reloading.'
      )
    ).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Reload' }));
    expect(retry).toHaveBeenCalledTimes(1);
    await fireEvent.press(screen.getByRole('button', { name: 'Go to Home' }));
    expect(mockReplace).toHaveBeenCalledWith('/');
  });

  it('speaks Bangla in Bangla', async () => {
    setLang('bn');
    await render(<ErrorScreen error={new Error('boom')} retry={() => Promise.resolve()} />);
    expect(screen.getByText('কিছু একটা সমস্যা হয়েছে')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'আবার লোড করুন' })).toBeOnTheScreen();
    setLang('en');
  });
});
