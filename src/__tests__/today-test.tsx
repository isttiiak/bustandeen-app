import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { copy, digits, fill } from '@/features/home/copy';
import { formatClock, formatCountdown, nextPrayer, SAMPLE_DAY } from '@/features/home/schedule';
import { TodayScreen } from '@/features/home/screens/TodayScreen';
import { setLang } from '@/features/settings/langStore';
import { ToastProvider } from '@/ui/Overlays';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning' },
}));
jest.mock('expo-router', () => ({ useRouter: () => ({ navigate: jest.fn() }) }));

const at = (h: number, m = 0, s = 0) => new Date(2026, 10, 19, h, m, s);

describe('sample schedule (design prototype only)', () => {
  it('finds the next tracked prayer and skips sunrise', () => {
    expect(nextPrayer(at(4, 0)).prayer.id).toBe('fajr');
    expect(nextPrayer(at(5, 30)).prayer.id).toBe('dhuhr'); // sunrise at 6:20 is not a prayer to log
    expect(nextPrayer(at(12, 0)).prayer.id).toBe('asr');
    expect(nextPrayer(at(18, 0)).prayer.id).toBe('isha');
  });

  it('wraps to Fajr after Isha and counts to tomorrow', () => {
    const n = nextPrayer(at(23, 0));
    expect(n.prayer.id).toBe('fajr');
    // 23:00 -> 05:02 next day = 6h 2m
    expect(n.msLeft).toBe((6 * 60 + 2) * 60000);
  });

  it('reports how far we are between two prayers', () => {
    const n = nextPrayer(at(13, 30)); // Dhuhr 11:52 -> Asr 15:08
    expect(n.prayer.id).toBe('asr');
    expect(n.elapsed).toBeGreaterThan(0.4);
    expect(n.elapsed).toBeLessThan(0.6);
    expect(nextPrayer(at(2, 0)).elapsed).toBeGreaterThan(0); // before Fajr: since last night's Isha
  });

  it('formats clock and countdown', () => {
    expect(formatClock(5 * 60 + 2)).toBe('05:02');
    expect(formatCountdown(((8 * 60 + 54) * 60 + 25) * 1000)).toBe('08:54:25');
    expect(formatCountdown(-5)).toBe('00:00:00');
    expect(SAMPLE_DAY.filter((p) => p.tracked)).toHaveLength(5);
  });
});

describe('copy', () => {
  it('has a Bangla string for every English key', () => {
    expect(Object.keys(copy.bn).sort()).toEqual(Object.keys(copy.en).sort());
  });

  it('fills placeholders and converts digits', () => {
    expect(fill('Mark {{name}} as done', { name: 'Asr' })).toBe('Mark Asr as done');
    expect(digits('05:02', 'bn')).toBe('০৫:০২');
    expect(digits('05:02', 'en')).toBe('05:02');
  });
});

describe('Today screen', () => {
  beforeEach(() => setLang('en'));

  const renderToday = async () =>
    render(
      <ToastProvider>
        <TodayScreen />
      </ToastProvider>
    );

  it('shows the next prayer, the ring and the prayer list at once', async () => {
    await renderToday();
    expect(screen.getByTestId('next-prayer')).toBeOnTheScreen();
    expect(screen.getByText("Today's prayers")).toBeOnTheScreen();
    for (const name of ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']) {
      expect(screen.getAllByText(name).length).toBeGreaterThan(0);
    }
    expect(screen.getByRole('progressbar', { name: 'Prayers today: 2/5' })).toBeOnTheScreen();
  });

  it('marks a prayer done and updates the ring', async () => {
    await renderToday();
    const asr = screen.getByRole('checkbox', { name: 'Asr:' });
    expect(asr).not.toBeChecked();
    await fireEvent.press(asr);
    expect(screen.getByRole('checkbox', { name: 'Asr: Done' })).toBeChecked();
    expect(screen.getByRole('progressbar', { name: 'Prayers today: 3/5' })).toBeOnTheScreen();
  });

  it('celebrates when all five are done, once', async () => {
    jest.useFakeTimers();
    await renderToday();
    for (const name of ['Asr:', 'Maghrib:'])
      await fireEvent.press(screen.getByRole('checkbox', { name }));
    expect(screen.queryByText('All five prayers done')).toBeNull();
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Isha:' }));
    expect(screen.getAllByText('All five prayers done').length).toBeGreaterThan(0);
    await act(async () => {
      jest.advanceTimersByTime(4000);
    });
    jest.useRealTimers();
  });

  it('switches to Bangla with Bangla digits and web wording', async () => {
    await renderToday();
    await act(async () => setLang('bn'));
    expect(screen.getAllByText('আজকের নামায', { exact: false }).length).toBeGreaterThan(0);
    expect(screen.getAllByText('যুহর', { exact: false }).length).toBeGreaterThan(0);
    expect(screen.getAllByText('০৫:০২', { exact: false }).length).toBeGreaterThan(0);
  });
});
