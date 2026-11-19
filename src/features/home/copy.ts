// Prototype copy for the Today tab and the tab bar (task P2-05), English and Bangla. Wording is
// reused from the web app's locale files where the text is identical (prayer names, Done, Today,
// Streak, Settings, Language); the rest is new and is marked `new` for the owner's Bangla review.
// P2-06 moves all of it into i18next with an `i18n:check`.
import type { Lang } from '@/features/settings/langStore';

export const copy = {
  en: {
    tabToday: 'Today',
    tabSalat: 'Salat',
    tabQuran: 'Quran',
    tabZikr: 'Zikr',
    tabMore: 'More', // new
    nextPrayer: 'Next prayer', // web: home.nextPrayerComing (similar)
    timeLeft: 'Time left', // new
    todaysPrayers: "Today's prayers", // new
    done: 'Done',
    sunrise: 'Sunrise',
    fajr: 'Fajr',
    dhuhr: 'Dhuhr',
    asr: 'Asr',
    maghrib: 'Maghrib',
    isha: 'Isha',
    markDone: 'Mark {{name}} as done', // new (screen reader)
    markUndone: 'Mark {{name}} as not done', // new (screen reader)
    prayersToday: 'Prayers today', // new
    streak: 'Streak',
    days: 'days', // new
    thisWeek: 'This week', // new
    average: 'Average', // new
    allDone: 'All five prayers done', // new
    quickZikr: 'Zikr',
    quickQuran: 'Quran',
    quickQibla: 'Qibla', // web: landing.tools.qibla
    soon: 'Coming in a later phase', // new
    sampleNote: 'Sample times for design review', // new
    location: 'Dhaka (sample)', // new
    appearance: 'Appearance', // web: settings.appearanceSection
    language: 'Language',
    themeSystem: 'System', // new
    themeDark: 'Dark',
    themeLight: 'Light',
    themeWarm: 'Warm', // new
    themeMixed: 'Mixed', // new
    themeDaylight: 'Daylight', // web
    moreTitle: 'More', // new
    prototype: 'Design prototype: sample data, nothing is saved', // new
  },
  bn: {
    tabToday: 'আজ',
    tabSalat: 'সালাত',
    tabQuran: 'কুরআন',
    tabZikr: 'যিকির',
    tabMore: 'আরও',
    nextPrayer: 'পরবর্তী নামায',
    timeLeft: 'বাকি সময়',
    todaysPrayers: 'আজকের নামায',
    done: 'সম্পন্ন',
    sunrise: 'সূর্যোদয়',
    fajr: 'ফজর',
    dhuhr: 'যুহর',
    asr: 'আসর',
    maghrib: 'মাগরিব',
    isha: 'ইশা',
    markDone: '{{name}} সম্পন্ন করুন',
    markUndone: '{{name}} সম্পন্ন হয়নি করুন',
    prayersToday: 'আজকের নামায',
    streak: 'ধারাবাহিকতা',
    days: 'দিন',
    thisWeek: 'এই সপ্তাহ',
    average: 'গড়',
    allDone: 'পাঁচ ওয়াক্তই সম্পন্ন',
    quickZikr: 'যিকির',
    quickQuran: 'কুরআন',
    quickQibla: 'কিবলা',
    soon: 'পরের ধাপে আসছে',
    sampleNote: 'ডিজাইন দেখার জন্য নমুনা সময়',
    location: 'ঢাকা (নমুনা)',
    appearance: 'থিম',
    language: 'ভাষা',
    themeSystem: 'সিস্টেম',
    themeDark: 'ডার্ক',
    themeLight: 'লাইট',
    themeWarm: 'উষ্ণ',
    themeMixed: 'মিশ্র',
    themeDaylight: 'দিনের আলো',
    moreTitle: 'আরও',
    prototype: 'ডিজাইন প্রোটোটাইপ: নমুনা তথ্য, কিছু সংরক্ষিত হয় না',
  },
} as const;

export type Copy = { [K in keyof (typeof copy)['en']]: string };

export const copyFor = (lang: Lang): Copy => copy[lang];

/** Fills `{{name}}` style placeholders. */
export function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, k: string) => values[k] ?? '');
}

const BANGLA_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

/** Digits in the language's numerals (Bangla digits in Bangla, as the web does). */
export function digits(value: string | number, lang: Lang): string {
  const s = String(value);
  return lang === 'bn' ? s.replace(/\d/g, (d) => BANGLA_DIGITS[Number(d)]) : s;
}
