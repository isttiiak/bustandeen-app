import { Redirect } from 'expo-router';
import type { ComponentType } from 'react';

// Development only (task P2-07). Same dead-branch rule as the gallery: not in a production bundle.
const Spike: ComponentType | null = __DEV__
  ? // eslint-disable-next-line @typescript-eslint/no-require-imports -- must stay a dead branch in production
    require('@/features/settings/dev/StorageSpike').StorageSpike
  : null;

export default function StorageSpikeRoute() {
  return Spike ? <Spike /> : <Redirect href="/" />;
}
