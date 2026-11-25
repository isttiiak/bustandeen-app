import Constants from 'expo-constants';
import { useSegments } from 'expo-router';
import { useEffect } from 'react';

import {
  buildReport,
  createReporter,
  routePattern,
  type ClientErrorKind,
  type ClientErrorPayload,
} from '@/lib/errorReport';

// Wires the crash report builder (src/lib/errorReport.ts) into the app: the current route pattern, the
// app version, render crashes from the error screen, and uncaught errors and unhandled promise failures.
// Release builds only, like the web (nothing is reported in development).

let currentRoute = '/';
const version = Constants.expoConfig?.version ?? '0.0.0';

/**
 * TODO(P2-10): send to `POST /api/client-errors` through the API client once it exists. Until then a report
 * is built and dropped: it is neither stored nor sent (owner, 2026-11-26, Q3).
 */
function deliver(_payload: ClientErrorPayload): void {}

const report = createReporter(deliver);

/** Reports one error. Never throws. Returns the payload it would send (null when skipped), for tests. */
export function reportError(error: unknown, kind: ClientErrorKind): ClientErrorPayload | null {
  try {
    const payload = buildReport(error, kind, { route: currentRoute, version });
    if (payload && !__DEV__) report(payload);
    return payload;
  } catch {
    return null;
  }
}

/** Keeps the current route pattern for reports. Mount once at the root. */
export function useTrackRoute(): void {
  const segments = useSegments();
  const key = segments.join('/');
  useEffect(() => {
    currentRoute = routePattern(key.split('/'));
  }, [key]);
}

interface HermesTracker {
  enablePromiseRejectionTracker?: (options: {
    allRejections: boolean;
    onUnhandled: (id: number, rejection: unknown) => void;
    onHandled: () => void;
  }) => void;
}

let installed = false;

/**
 * Uncaught errors and unhandled promise failures (release builds). The phone's own handling continues
 * unchanged after the report (owner, Q4): React Native's handler still runs.
 */
export function installErrorHooks(): void {
  if (installed || __DEV__) return;
  installed = true;
  const errorUtils = (
    global as {
      ErrorUtils?: {
        getGlobalHandler: () => (e: unknown, fatal?: boolean) => void;
        setGlobalHandler: (h: (e: unknown, fatal?: boolean) => void) => void;
      };
    }
  ).ErrorUtils;
  if (errorUtils) {
    const previous = errorUtils.getGlobalHandler();
    errorUtils.setGlobalHandler((e, fatal) => {
      reportError(e, 'error');
      previous(e, fatal);
    });
  }
  // React Native only tracks promise failures in development; Hermes can do it in release too.
  const hermes = (global as { HermesInternal?: HermesTracker }).HermesInternal;
  hermes?.enablePromiseRejectionTracker?.({
    allRejections: true,
    onUnhandled: (_id, rejection) => {
      reportError(rejection, 'rejection');
    },
    onHandled: () => undefined,
  });
}
