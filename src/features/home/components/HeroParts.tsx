import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Icon } from '@/ui/Icon';
import { Text } from '@/ui/Text';

import type { Copy } from '../copy';
import type { HeroInfo } from '../heroInfo';

/** "Current prayer" or, in a forbidden time, a warning pill that takes the prayer's place. */
export function StatusPill({ info }: { info: HeroInfo }) {
  return (
    <View className="flex-row items-center gap-1.5 rounded-full bg-hero-ink/15 px-3 py-1">
      {info.kind === 'forbidden' ? <Icon name="warning" size={14} color="hero-ink" /> : null}
      <Text variant="caption" tone="hero" weight="semibold" tight>
        {info.label}
      </Text>
    </View>
  );
}

/** Next prayer on the left; iftar or suhoor on the right when the user is fasting. Both columns have
 *  the same shape: a small label, the time big, and (fasting only) how long is left. */
export function NextFastRow({ info, c }: { info: HeroInfo; c: Copy }) {
  return (
    <View className="mt-3 w-full flex-row items-stretch border-t border-hero-ink/15 pt-3">
      <View className="flex-1 items-center gap-0.5">
        <Text variant="caption" tone="hero" className="text-center opacity-70">
          {`${c.nextLabel} · ${info.next.name}`}
        </Text>
        <Text variant="h2" tone="hero" tabular className="text-center">
          {info.next.time}
        </Text>
      </View>
      {info.fast ? (
        <>
          <View className="mx-2 w-px bg-hero-ink/15" />
          <View className="flex-1 items-center gap-0.5">
            <Text variant="caption" tone="hero" className="text-center opacity-70">
              {info.fast.label}
            </Text>
            <Text variant="h2" tone="hero" tabular className="text-center">
              {info.fast.time}
            </Text>
            <Text variant="caption" tone="hero" tabular className="text-center opacity-70">
              {info.fast.left}
            </Text>
          </View>
        </>
      ) : null}
    </View>
  );
}

/** Layout A: everything inside the arch. */
export function ArchInfo({
  info,
  c,
  children,
}: {
  info: HeroInfo;
  c: Copy;
  /** The prayer timeline, drawn between the countdown and the next/iftar row. */
  children?: ReactNode;
}) {
  const wide = info.kind === 'prayer';
  return (
    <View className="items-center gap-1" accessible accessibilityLabel={info.spoken}>
      <StatusPill info={info} />
      <Text variant={wide ? 'display' : 'h1'} tone="hero" className="mt-1 text-center">
        {info.title}
      </Text>
      <Text variant={wide ? 'h2' : 'lead'} tone="hero" tabular className="text-center">
        {info.window}
      </Text>
      <View className="mt-2 items-center">
        <Text variant="caption" tone="hero" className="opacity-70">
          {info.countLabel}
        </Text>
        <Text variant="h1" tone="hero" tabular className="text-center">
          {info.countdown}
        </Text>
      </View>
      {children}
      <NextFastRow info={info} c={c} />
    </View>
  );
}
