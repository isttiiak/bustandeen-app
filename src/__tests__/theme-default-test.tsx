import { renderHook } from '@testing-library/react-native';

import { useThemeMode } from '@/theme/ThemeProvider';

describe('theme default', () => {
  it('starts in Night, the app’s dark-first theme', async () => {
    const { result } = await renderHook(() => useThemeMode());
    expect(result.current).toBe('night');
  });
});
