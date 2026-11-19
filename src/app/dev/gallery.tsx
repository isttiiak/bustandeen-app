import { Redirect } from 'expo-router';
import type { ComponentType } from 'react';

// Development only (task P2-04). In a production bundle `__DEV__` is false, Metro folds the branch
// away and the gallery code is never bundled (checked by src/__tests__/dev-routes-test.ts).
const Gallery: ComponentType | null = __DEV__
  ? // eslint-disable-next-line @typescript-eslint/no-require-imports -- must stay a dead branch in production
    require('@/ui/gallery/Gallery').Gallery
  : null;

export default function GalleryRoute() {
  return Gallery ? <Gallery /> : <Redirect href="/" />;
}
