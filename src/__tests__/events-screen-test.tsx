import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { EventsScreen } from '@/features/events/screens/EventsScreen';
import { setLang } from '@/features/settings/langStore';
import { ToastProvider } from '@/ui/Overlays';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning' },
}));
let mockParams: Record<string, string> = {};
jest.mock('expo-router', () => ({ useLocalSearchParams: () => mockParams }));

const show = async (params: Record<string, string>) => {
  mockParams = params;
  await render(
    <ToastProvider>
      <EventsScreen />
    </ToastProvider>
  );
};

beforeEach(() => act(async () => setLang('en')));

describe("Today's tab", () => {
  it('reads the arch as one element with every date and the sample mark', async () => {
    await show({ d: '2026-11-29', country: 'BD' });
    expect(
      screen.getByLabelText(
        /^19 Jumādā al-Ākhirah 1448 AH, .*2026, ১৪ অগ্রহায়ণ ১৪৩৩ বঙ্গাব্দ, Umm al-Qura calendar, Sample$/
      )
    ).toBeTruthy();
    expect(screen.getByText('No special day today')).toBeTruthy();
  });

  it('lists several events, and only Islamic days are buttons', async () => {
    await show({ d: '2026-03-20', country: 'BD' });
    const buttons = screen.getAllByRole('button').map((b) => b.props.accessibilityLabel);
    expect(buttons).toEqual(expect.arrayContaining([expect.stringMatching(/^Eid al-Fiṭr, /)]));
    expect(buttons.some((l: string) => l.startsWith('Jumatul Bidaa'))).toBe(false);
    expect(screen.getByLabelText(/^Jumatul Bidaa, Government holiday/)).toBeTruthy();
  });

  it('hides Bengali and holidays with no country', async () => {
    await show({ d: '2026-12-16', country: 'none' });
    expect(screen.queryByText(/বঙ্গাব্দ/)).toBeNull();
    expect(screen.queryByText('Victory Day')).toBeNull();
    expect(screen.getByText(/at midnight here/)).toBeTruthy();
  });

  it('shows Bangla with Bangla digits', async () => {
    await act(async () => setLang('bn'));
    await show({ d: '2026-11-29', country: 'BD' });
    expect(screen.getByLabelText(/^১৯ জুমাদাল আখিরাহ ১৪৪৮ হিজরি/)).toBeTruthy();
  });

  it('says so for a day outside the sample, instead of guessing', async () => {
    await show({ d: '2031-01-01' });
    expect(screen.getByText('No sample dates for this day.')).toBeTruthy();
  });

  it('shows no religious prose and no citation', async () => {
    await show({ d: '2026-05-26', country: 'GB' });
    expect(screen.getByText('Day of Arafah')).toBeTruthy();
    expect(screen.queryByText(/expiates|Ṣaḥīḥ|Muslim \d/)).toBeNull();
  });

  it('later pages say they are coming', async () => {
    await show({ d: '2026-11-29', country: 'BD' });
    await fireEvent.press(screen.getByLabelText('Calendar settings'));
    expect(screen.getByText('Coming in a later phase')).toBeTruthy();
  });
});
