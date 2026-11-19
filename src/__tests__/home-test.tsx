import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { copy, digits, fill } from '@/features/home/copy';
import {
  dayState,
  fastingMark,
  formatClock,
  formatCountdown,
  nextPrayer,
  SAMPLE_DAY,
} from '@/features/home/schedule';
import { HomeScreen } from '@/features/home/screens/HomeScreen';
import { setProto } from '@/features/home/proto';
import { verseOfDay, VERSES } from '@/features/home/verses';
import { setLang } from '@/features/settings/langStore';
import { ToastProvider } from '@/ui/Overlays';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning' },
}));
jest.mock('expo-router', () => ({
  useRouter: () => ({ navigate: jest.fn() }),
  useLocalSearchParams: () => ({}),
}));

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

describe('day state (sample rules)', () => {
  it('names the prayer in each window and its end', () => {
    const s = dayState(at(13));
    expect(s.kind === 'prayer' && s.id).toBe('dhuhr');
    expect(s.kind === 'prayer' && s.end).toBe(15 * 60 + 8);
    expect(dayState(at(16)).kind === 'prayer' && (dayState(at(16)) as { id: string }).id).toBe(
      'asr'
    );
    expect((dayState(at(21)) as { id: string }).id).toBe('isha');
  });

  it('keeps Isha going until Fajr, after midnight too', () => {
    const s = dayState(at(4, 30));
    expect(s.kind === 'prayer' && s.id).toBe('isha');
    expect(s.kind === 'prayer' && s.msLeft).toBe(32 * 60000);
  });

  it('shows forbidden time in place of the prayer', () => {
    for (const [h, m, reason] of [
      [6, 25, 'sunrise'],
      [11, 48, 'zenith'],
      [17, 15, 'sunset'],
    ] as const) {
      const s = dayState(at(h, m));
      expect(s.kind).toBe('forbidden');
      expect(s.kind === 'forbidden' && s.reason).toBe(reason);
    }
  });

  it('is between prayers from sunrise to Dhuhr', () => {
    expect(dayState(at(9)).kind).toBe('between');
  });

  it('marks suhoor before Fajr, iftar until Maghrib, nothing after', () => {
    expect(fastingMark(at(4))?.kind).toBe('suhoor');
    expect(fastingMark(at(13))?.kind).toBe('iftar');
    expect(fastingMark(at(13))?.at).toBe(17 * 60 + 26);
    expect(fastingMark(at(19))).toBeNull();
  });
});

describe('verse of the day', () => {
  it('is stable within a day and changes the next day', () => {
    expect(verseOfDay(at(1)).key).toBe(verseOfDay(at(23)).key);
    expect(verseOfDay(new Date(2026, 10, 20)).key).not.toBe(verseOfDay(at(12)).key);
    expect(VERSES.every((v) => v.arabic && v.en && v.bn && /^\d+:\d+$/.test(v.key))).toBe(true);
  });
});

describe('Home screen', () => {
  beforeEach(() => {
    setLang('en');
    setProto({ layout: 'a', simMinutes: 13 * 60, fasting: true, active: true });
  });

  const renderHome = async () =>
    render(
      <ToastProvider>
        <HomeScreen />
      </ToastProvider>
    );

  it('layout A: current prayer with start and end, next prayer, iftar, verse and the five cards', async () => {
    await renderHome();
    expect(screen.getByTestId('hero')).toBeOnTheScreen();
    expect(screen.getByText('Current prayer')).toBeOnTheScreen();
    expect(screen.getByText('11:52 - 15:08')).toBeOnTheScreen();
    expect(screen.getByText('Iftar')).toBeOnTheScreen();
    expect(screen.getByText('Verse of the day')).toBeOnTheScreen();
    for (const name of ['Prayer times', 'Tracker', 'Zikr', 'Quran', 'Fasting']) {
      expect(screen.getByRole('button', { name: `Open ${name}` })).toBeOnTheScreen();
    }
  });

  it('puts forbidden time in the place of the current prayer', async () => {
    setProto({ simMinutes: 6 * 60 + 25 });
    await renderHome();
    expect(screen.getByText('Forbidden time')).toBeOnTheScreen();
    expect(screen.queryByText('Current prayer')).toBeNull();
  });

  it('shows suhoor before Fajr and no fasting line when not fasting', async () => {
    setProto({ simMinutes: 4 * 60 + 30 });
    await renderHome();
    expect(screen.getByText('Suhoor ends')).toBeOnTheScreen();
    await act(async () => setProto({ fasting: false }));
    expect(screen.queryByText('Suhoor ends')).toBeNull();
  });

  it('counter cards: count, else streak, else the word', async () => {
    await renderHome();
    expect(screen.getByText('33')).toBeOnTheScreen(); // zikr count today
    expect(screen.getByText('day streak')).toBeOnTheScreen(); // quran streak 4
    await act(async () => setProto({ active: false }));
    expect(screen.queryByText('33')).toBeNull();
    expect(screen.getAllByText('Zikr').length).toBeGreaterThan(1); // card title + the word
  });

  it('layout B ticks a prayer from the hero and updates the tracker ring', async () => {
    setProto({ layout: 'b' });
    await renderHome();
    const asr = screen.getByRole('checkbox', { name: 'Asr' });
    expect(asr).not.toBeChecked();
    await fireEvent.press(asr);
    expect(screen.getByRole('checkbox', { name: 'Asr' })).toBeChecked();
    expect(screen.getByRole('progressbar', { name: 'Prayers today: 3/5' })).toBeOnTheScreen();
  });

  it('opens the full prayer times from the card', async () => {
    await renderHome();
    await fireEvent.press(screen.getByRole('button', { name: 'Open Prayer times' }));
    expect(screen.getByText('Sunrise')).toBeOnTheScreen();
  });

  it('switches to Bangla with Bangla digits', async () => {
    await renderHome();
    await act(async () => setLang('bn'));
    expect(screen.getAllByText('যুহর', { exact: false }).length).toBeGreaterThan(0);
    expect(screen.getAllByText('১১:৫২', { exact: false }).length).toBeGreaterThan(0);
    expect(screen.getByText('আজকের আয়াত', { exact: false })).toBeOnTheScreen();
  });
});
