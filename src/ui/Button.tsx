import { ActivityIndicator, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';
import { Text, type TextTone } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'danger';

// Literal classes so Tailwind sees them. Primary is the solid action (white on the dim emerald, 4.8:1).
const surface: Record<ButtonVariant, string> = {
  primary: 'bg-emerald-dim',
  secondary: 'bg-deep border border-border',
  quiet: '',
  danger: 'bg-danger/10 border border-danger/40',
};
const tone: Record<ButtonVariant, TextTone> = {
  primary: 'onColor',
  secondary: 'ink',
  quiet: 'muted',
  danger: 'danger',
};

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  /** Stretch to the parent's width. */
  fill?: boolean;
  accessibilityHint?: string;
  testID?: string;
}

/** One primary action per screen (doc 06 section 5). 48 dp minimum height. */
export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading,
  disabled,
  fill,
  accessibilityHint,
  testID,
}: ButtonProps) {
  const theme = useTheme();
  const inactive = disabled || loading;
  return (
    <View className={fill ? 'self-stretch' : 'self-start'}>
      <PressableScale
        onPress={onPress}
        disabled={inactive}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ busy: !!loading }}
        testID={testID}
        className={`min-h-12 flex-row items-center justify-center gap-2 rounded-control px-4 ${surface[variant]} ${disabled ? 'opacity-50' : ''}`}
      >
        {loading ? (
          <ActivityIndicator color={theme.color(variant === 'primary' ? 'on-color' : 'ink')} />
        ) : icon ? (
          <Icon name={icon} size={20} color={variant === 'primary' ? 'on-color' : 'ink'} />
        ) : null}
        <Text tight weight="bold" tone={tone[variant]} className="text-center">
          {label}
        </Text>
      </PressableScale>
    </View>
  );
}

export interface IconButtonProps {
  icon: IconName;
  /** Required: an icon alone has no name for a screen reader. */
  label: string;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
}

/** A 48 dp icon-only button. */
export function IconButton({ icon, label, onPress, disabled, testID }: IconButtonProps) {
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      className={`h-12 w-12 items-center justify-center rounded-full bg-surface/60 ${disabled ? 'opacity-50' : ''}`}
    >
      <Icon name={icon} size={22} />
    </PressableScale>
  );
}
