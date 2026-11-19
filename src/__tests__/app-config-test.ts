import type { ConfigContext } from 'expo/config';

import { hex } from '@/theme/tokens';
import appConfig, { APP_ID, APP_SCHEME } from '../../app.config';

// The store identity can never change after the first release (decision O13).
// This test fails loudly if someone edits it by accident.
describe('app identity', () => {
  const config = appConfig({ config: {} } as ConfigContext);

  it('keeps the name, slug and scheme', () => {
    expect(config.name).toBe('Bustandeen');
    expect(config.slug).toBe('bustandeen-app');
    expect(config.scheme).toBe('bustandeen');
    expect(APP_SCHEME).toBe('bustandeen');
  });

  it('uses the same id on Android and iOS', () => {
    expect(APP_ID).toBe('com.bustandeen.app');
    expect(config.android?.package).toBe('com.bustandeen.app');
    expect(config.ios?.bundleIdentifier).toBe('com.bustandeen.app');
  });

  it('is portrait on phones', () => {
    expect(config.orientation).toBe('portrait');
  });

  it('blocks storage and overlay permissions in the main manifest (D11)', () => {
    expect(config.android?.blockedPermissions).toEqual(
      expect.arrayContaining([
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.WRITE_EXTERNAL_STORAGE',
        'android.permission.SYSTEM_ALERT_WINDOW',
      ])
    );
  });

  it('paints the splash with the theme void colour in both themes', () => {
    const splash = config.plugins?.find((p) => Array.isArray(p) && p[0] === 'expo-splash-screen');
    const options = (Array.isArray(splash) ? splash[1] : {}) as {
      backgroundColor: string;
      dark: { backgroundColor: string };
    };
    expect(options.backgroundColor).toBe(hex('light', 'void'));
    expect(options.dark.backgroundColor).toBe(hex('dark', 'void'));
  });
});
