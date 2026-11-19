import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

/** Section heading, optionally with a leading icon. */
export function SectionTitle({ children, icon }: { children: string; icon?: IconName }) {
  return (
    <View className="flex-row items-center gap-2" accessibilityRole="header">
      {icon ? <Icon name={icon} size={20} color="gold" /> : null}
      <Text variant="lead" display weight="bold" className="flex-1">
        {children}
      </Text>
    </View>
  );
}

export interface ListItemProps {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  onPress?: () => void;
  testID?: string;
}

/** A row inside a card or list. Tappable rows show a chevron that flips in RTL. */
export function ListItem({ title, subtitle, leading, trailing, onPress, testID }: ListItemProps) {
  const body = (
    <>
      {leading}
      <View className="flex-1">
        <Text weight="semibold">{title}</Text>
        {subtitle ? (
          <Text variant="small" tone="muted">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ?? (onPress ? <Icon name="chevron-end" size={20} color="ink" mirrorInRtl /> : null)}
    </>
  );
  const classes =
    'min-h-12 flex-row items-center gap-3 rounded-control border border-border bg-surface/50 p-3';
  return onPress ? (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      testID={testID}
      className={classes}
    >
      {body}
    </PressableScale>
  ) : (
    <View className={classes} testID={testID}>
      {body}
    </View>
  );
}

/** A warm empty state that suggests one next step (doc 06 section 5). */
export function EmptyState({
  title,
  message,
  action,
  icon = 'moon',
}: {
  title: string;
  message?: string;
  action?: ReactNode;
  icon?: IconName;
}) {
  return (
    <View
      className="items-center gap-3 px-6 py-8"
      accessible
      accessibilityLabel={message ? `${title}. ${message}` : title}
    >
      <View className="h-16 w-16 items-center justify-center rounded-full bg-surface">
        <Icon name={icon} size={30} color="gold" />
      </View>
      <Text variant="title" display weight="bold" className="text-center">
        {title}
      </Text>
      {message ? (
        <Text tone="muted" className="text-center">
          {message}
        </Text>
      ) : null}
      {action ? <View className="flex-row justify-center">{action}</View> : null}
    </View>
  );
}

/** A small banner shown when the screen is working from saved data. */
export function OfflineNote({ message }: { message: string }) {
  return (
    <View
      className="flex-row items-center gap-2 rounded-control border border-border bg-surface/50 px-3 py-2"
      accessible
      accessibilityRole="alert"
      accessibilityLabel={message}
    >
      <Icon name="offline" size={18} color="warm" />
      <Text variant="small" tone="muted" className="flex-1">
        {message}
      </Text>
    </View>
  );
}
