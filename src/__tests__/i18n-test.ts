import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { setLang } from '@/features/settings/langStore';
import { i18n, initialLang } from '@/lib/i18n';
import { PREF_KEYS, prefStore } from '@/lib/prefs';
import { checkLocales, flatten, type Tree } from '@/locales/check';

const load = (lang: string): Tree =>
  JSON.parse(readFileSync(join(__dirname, `../locales/${lang}/common.json`), 'utf8'));

describe('locale files', () => {
  it('pass the i18n check (every en key has a bn key, placeholders agree)', () => {
    expect(checkLocales(load('en'), load('bn'))).toEqual([]);
  });

  it('keep the website path and wording for keys shared with the website', () => {
    const en = flatten(load('en'));
    const bn = flatten(load('bn'));
    expect(en['prayerTimes.fajr']).toBe('Fajr');
    expect(bn['prayerTimes.fajr']).toBe('ফজর');
    expect(en['settings.language']).toBeTruthy();
  });
});

describe('the check fails on bad files (fixtures)', () => {
  const en: Tree = { a: 'One', b: 'Hello {{name}}', c: { d: 'Deep' }, e: 'Fine' };

  it('flags a missing bn key and an extra bn key', () => {
    const f = checkLocales(en, { a: 'এক', b: 'হ্যালো {{name}}', c: { d: 'গভীর' }, z: 'অতিরিক্ত' });
    expect(f).toEqual(
      expect.arrayContaining([
        { key: 'e', problem: 'missing in bn' },
        { key: 'z', problem: 'missing in en' },
      ])
    );
  });

  it('flags changed placeholders, empty text, em dashes and romanised Bangla', () => {
    const f = checkLocales(
      { p: 'Hi {{name}}', q: 'Text', r: 'Dash', s: 'Word' },
      { p: 'হাই {{user}}', q: ' ', r: 'ড্যাশ — এখানে', s: 'Shobdo' }
    );
    const problems = f.map((x) => `${x.key}:${x.problem}`);
    expect(problems).toEqual(
      expect.arrayContaining([
        'p:placeholders differ between en and bn',
        'q:empty text',
        'r:em dash in copy',
        's:bn text is not in Bangla script',
      ])
    );
  });

  it('does not require Bangla script for prototype-only labels', () => {
    expect(checkLocales({ proto: { x: 'Layout' } }, { proto: { x: 'Layout' } })).toEqual([]);
  });
});

describe('language at runtime', () => {
  it('uses the saved language first, then the phone language (English here)', () => {
    prefStore.setString(PREF_KEYS.lang, 'bn');
    expect(initialLang()).toBe('bn');
    prefStore.remove(PREF_KEYS.lang);
    expect(initialLang()).toBe('en');
  });

  it('switches live, keeps placeholders and saves the choice', () => {
    setLang('bn');
    expect(i18n.t('prayerTimes.fajr')).toBe('ফজর');
    expect(i18n.t('app.openCard', { name: 'X' })).toContain('X');
    expect(prefStore.getString(PREF_KEYS.lang)).toBe('bn');
    setLang('en');
    expect(i18n.t('prayerTimes.fajr')).toBe('Fajr');
  });
});

describe('device language default', () => {
  it('follows a Bangla phone, and English for anything else', () => {
    jest.isolateModules(() => {
      jest.doMock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'bn' }] }));
      // eslint-disable-next-line @typescript-eslint/no-require-imports -- fresh module under the mock
      expect(require('@/lib/i18n').deviceLang()).toBe('bn');
    });
    jest.isolateModules(() => {
      jest.doMock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'ar' }] }));
      // eslint-disable-next-line @typescript-eslint/no-require-imports -- fresh module under the mock
      expect(require('@/lib/i18n').deviceLang()).toBe('en');
    });
  });
});
