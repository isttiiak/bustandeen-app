import type { ReactNode } from 'react';
import { View } from 'react-native';

import { ArchHero } from '@/ui/Art';

import type { HeroFrameKind } from '../proto';

/** The shape around the Home hero: the mihrab-style arch, or a plain rounded card with the same
 *  colours. Both layouts (A and B) can sit in either. */
export function HeroFrame({ frame, children }: { frame: HeroFrameKind; children: ReactNode }) {
  if (frame === 'arch') return <ArchHero testID="hero">{children}</ArchHero>;
  return (
    <View testID="hero" className="rounded-[28px] border border-border bg-hero p-5">
      {children}
    </View>
  );
}
