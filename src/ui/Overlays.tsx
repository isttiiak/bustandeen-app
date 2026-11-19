import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Modal, Pressable, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, type ButtonVariant } from './Button';
import { haptic } from './haptics';
import { Icon } from './Icon';
import { duration, easeOut, springSoft, useReduceMotion } from './motion';
import { Text } from './Text';

// Shared enter/exit progress for modal surfaces: 0 = hidden, 1 = shown. The surface stays mounted
// until the exit finishes. With reduce motion the surface fades instead of moving.
function useModalProgress(visible: boolean) {
  const [mounted, setMounted] = useState(visible);
  const progress = useSharedValue(visible ? 1 : 0);
  const reduce = useReduceMotion();

  // Opening mounts the surface during render (React's pattern for state derived from props).
  if (visible && !mounted) setMounted(true);

  useEffect(() => {
    if (visible) {
      progress.set(
        withTiming(1, {
          duration: reduce ? duration.fast : duration.base,
          easing: easeOut,
        })
      );
    } else if (mounted) {
      progress.set(
        withTiming(0, { duration: duration.fast, easing: easeOut }, (done) => {
          if (done) runOnJS(setMounted)(false);
        })
      );
    }
    // `mounted` is read only to skip a no-op exit; it must not retrigger the effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, reduce, progress]);

  return { mounted, progress, reduce };
}

/**
 * A bottom sheet: drag the grabber (or the sheet) down, tap the dim area, or press the hardware
 * back button to close. Quick logging and pickers live here (doc 06 section 6).
 */
export function Sheet({
  visible,
  onClose,
  title,
  children,
  closeLabel,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
  /** Accessible name of the dim area that closes the sheet. */
  closeLabel: string;
}) {
  const { mounted, progress, reduce } = useModalProgress(visible);
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const drag = useSharedValue(0);

  useEffect(() => {
    if (visible) drag.set(0);
  }, [visible, drag]);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      drag.set(Math.max(0, e.translationY));
    })
    .onEnd((e) => {
      if (drag.get() > 120 || e.velocityY > 900) {
        runOnJS(onClose)();
      } else {
        drag.set(withSpring(0, springSoft));
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    opacity: reduce ? progress.get() : 1,
    transform: [{ translateY: (reduce ? 0 : (1 - progress.get()) * height * 0.6) + drag.get() }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.get() * 0.55 }));

  return (
    <Modal
      transparent
      visible={mounted}
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Animated.View className="absolute inset-0 bg-shade" style={backdropStyle}>
          <Pressable
            className="flex-1"
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={closeLabel}
          />
        </Animated.View>
        <GestureDetector gesture={pan}>
          <Animated.View
            accessibilityViewIsModal
            className="rounded-t-card border border-b-0 border-border bg-deep px-4 pt-2"
            style={[{ paddingBottom: insets.bottom + 16, maxHeight: height * 0.9 }, sheetStyle]}
          >
            <View className="mb-3 h-1.5 w-10 self-center rounded-full bg-ink/20" />
            {title ? (
              <Text variant="title" display weight="bold" className="mb-3">
                {title}
              </Text>
            ) : null}
            {children}
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
}

export interface DialogAction {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
}

/** A confirm dialog. Destructive ones must name what will be lost in `message` (doc 06 section 5). */
export function Dialog({
  visible,
  onClose,
  title,
  message,
  actions,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  actions: readonly DialogAction[];
}) {
  const { mounted, progress, reduce } = useModalProgress(visible);
  const panelStyle = useAnimatedStyle(() => ({
    opacity: progress.get(),
    transform: reduce ? [] : [{ scale: 0.96 + 0.04 * progress.get() }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.get() * 0.55 }));

  return (
    <Modal
      transparent
      visible={mounted}
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center px-6">
        <Animated.View className="absolute inset-0 bg-shade" style={backdropStyle} />
        <Animated.View
          accessibilityViewIsModal
          className="w-full max-w-md gap-3 rounded-card border border-border bg-deep p-5"
          style={panelStyle}
        >
          <Text variant="title" display weight="bold">
            {title}
          </Text>
          <Text tone="muted">{message}</Text>
          <View className="mt-2 gap-2">
            {actions.map((a) => (
              <Button
                key={a.label}
                label={a.label}
                variant={a.variant ?? 'secondary'}
                fill
                onPress={() => {
                  a.onPress();
                }}
              />
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

export type ToastKind = 'info' | 'success' | 'warning';
interface ToastItem {
  id: number;
  message: string;
  kind: ToastKind;
}
interface ToastApi {
  show: (message: string, kind?: ToastKind) => void;
}
const ToastContext = createContext<ToastApi>({ show: () => undefined });

export function useToast(): ToastApi {
  return useContext(ToastContext);
}

const TOAST_MS = 3200;

/** Short status messages that fade in, wait, and leave. Mount once near the root. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const next = useRef(1);
  const insets = useSafeAreaInsets();
  const reduce = useReduceMotion();

  const show = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = next.current++;
    setItems((cur) => [...cur.slice(-1), { id, message, kind }]);
    if (kind === 'success') haptic('success');
    if (kind === 'warning') haptic('warning');
    setTimeout(() => setItems((cur) => cur.filter((t) => t.id !== id)), TOAST_MS);
  }, []);

  const api = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <View
        pointerEvents="none"
        className="absolute inset-x-0 items-center gap-2 px-4"
        style={{ bottom: insets.bottom + 24 }}
      >
        {items.map((t) => (
          <Animated.View
            key={t.id}
            entering={reduce ? FadeIn.duration(duration.fast) : FadeInDown.duration(duration.base)}
            exiting={FadeOut.duration(duration.fast)}
            accessibilityLiveRegion="polite"
            accessibilityRole="alert"
            className="max-w-md flex-row items-center gap-2 rounded-full border border-border bg-deep px-4 py-3"
          >
            <Icon
              name={t.kind === 'success' ? 'check' : t.kind === 'warning' ? 'warning' : 'info'}
              size={18}
              color={t.kind === 'success' ? 'emerald' : t.kind === 'warning' ? 'warm' : 'gold'}
            />
            <Text variant="small" weight="medium" className="shrink">
              {t.message}
            </Text>
          </Animated.View>
        ))}
      </View>
    </ToastContext.Provider>
  );
}
