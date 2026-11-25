import type { ErrorBoundaryProps } from 'expo-router';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { ThemeProvider } from '@/theme/ThemeProvider';
import { Button } from '@/ui/Button';
import { haptic } from '@/ui/haptics';
import { Icon } from '@/ui/Icon';
import { duration, useReduceMotion } from '@/ui/motion';
import { Screen } from '@/ui/Screen';
import { Text } from '@/ui/Text';

import { reportError } from './reporting';

/**
 * The calm screen shown when a screen crashes while drawing (web `components/ErrorBoundary.tsx`, same
 * words). Reload draws the crashed screen again; Go to Home leaves it. Used by expo-router's
 * `ErrorBoundary` export at the root and for the tabs.
 */
export function ErrorScreen({ error, retry }: ErrorBoundaryProps) {
  // At the root the providers above may be gone with the crash; this one is cheap and safe to nest.
  return (
    <ThemeProvider>
      <ErrorBody error={error} retry={retry} />
    </ThemeProvider>
  );
}

function ErrorBody({ error, retry }: ErrorBoundaryProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const reduce = useReduceMotion();

  useEffect(() => {
    console.error('Unhandled render error:', error);
    reportError(error, 'render');
    haptic('medium');
  }, [error]);

  return (
    <Screen>
      <View
        className="flex-1 items-center justify-center gap-5 px-2"
        accessibilityLiveRegion="polite"
      >
        <Animated.View
          entering={reduce ? FadeIn.duration(duration.fast) : ZoomIn.duration(duration.slow)}
          className="h-16 w-16 items-center justify-center rounded-full bg-gold/15"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Icon name="alert" size={32} color="gold" />
        </Animated.View>
        <Animated.View
          entering={FadeIn.delay(reduce ? 0 : 120).duration(duration.slow)}
          className="w-full max-w-sm items-center gap-3"
        >
          <Text variant="h2" display className="self-stretch text-center">
            {t('errorBoundary.title')}
          </Text>
          <Text tone="muted" className="self-stretch text-center">
            {t('errorBoundary.body')}
          </Text>
          <View className="mt-2 gap-3 self-stretch">
            <Button label={t('errorBoundary.reload')} icon="refresh" fill onPress={retry} />
            <Button
              label={t('errorBoundary.home')}
              icon="home"
              variant="secondary"
              fill
              onPress={() => {
                router.replace('/');
                void retry();
              }}
            />
          </View>
        </Animated.View>
      </View>
    </Screen>
  );
}
