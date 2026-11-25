import { Redirect } from 'expo-router';
import type { ComponentType } from 'react';

// Development only (task P2-18a). Same dead-branch rule as the gallery: not in a production bundle.
const Crash: ComponentType | null = __DEV__
  ? // eslint-disable-next-line @typescript-eslint/no-require-imports -- must stay a dead branch in production
    require('@/features/errors/dev/CrashTest').CrashTest
  : null;

export default function CrashTestRoute() {
  return Crash ? <Crash /> : <Redirect href="/" />;
}

// The crash on this screen shows the error screen here.
export { ErrorScreen as ErrorBoundary } from '@/features/errors/ErrorScreen';
