import type { ReactNode } from 'react';
import { View } from 'react-native';

import { PressableScale, type PressableScaleProps } from './PressableScale';

const CARD = 'rounded-card border border-border bg-deep';

export interface CardProps extends Omit<PressableScaleProps, 'children' | 'className'> {
  className?: string;
  children?: ReactNode;
}

/** A raised surface. Border and surface contrast carry the lift, not shadows (doc 06 section 4).
 *  Pass `onPress` to make the whole card tappable (with press feedback and a label). */
export function Card({ className, children, onPress, ...rest }: CardProps) {
  const classes = className ? `${CARD} ${className}` : CARD;
  if (onPress) {
    return (
      <PressableScale accessibilityRole="button" onPress={onPress} className={classes} {...rest}>
        {children}
      </PressableScale>
    );
  }
  return (
    <View className={classes} testID={rest.testID}>
      {children}
    </View>
  );
}

/** A stat tile: a card with centred content. */
export function Tile({ className, ...props }: CardProps) {
  return <Card className={`items-center p-4 ${className ?? ''}`.trim()} {...props} />;
}
