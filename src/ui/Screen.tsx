import type { ReactElement, ReactNode } from 'react';
import { ScrollView, View, type RefreshControlProps } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

export interface ScreenProps {
  children?: ReactNode;
  /** Wrap the content in a vertical scroll view. */
  scroll?: boolean;
  /** 16 dp screen gutter (default on). */
  padded?: boolean;
  edges?: readonly Edge[];
  refreshControl?: ReactElement<RefreshControlProps>;
  testID?: string;
}

/** Safe area + theme background (+ optional scroll). Edge-to-edge is mandatory at target API 36. */
export function Screen({
  children,
  scroll,
  padded = true,
  edges,
  refreshControl,
  testID,
}: ScreenProps) {
  const gutter = padded ? 'px-4' : '';
  return (
    <SafeAreaView className="flex-1 bg-void" edges={edges} testID={testID}>
      {scroll ? (
        <ScrollView
          className="flex-1"
          contentContainerClassName={`${gutter} w-full max-w-[640px] gap-4 self-center pb-8 pt-2`}
          refreshControl={refreshControl}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View className={`w-full max-w-[640px] flex-1 self-center ${gutter}`}>{children}</View>
      )}
    </SafeAreaView>
  );
}
