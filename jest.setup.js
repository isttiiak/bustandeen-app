/* global jest */
// Native-module stand-ins for unit tests (no device). Reanimated and Worklets need native code that
// does not exist under Jest, and Reanimated 4's own mock does not load here, so this is a small
// hand-written stand-in for the parts the app uses. Animations resolve immediately.
jest.mock('react-native-worklets', () => ({}));

jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View, Text, ScrollView } = require('react-native');

  const useSharedValue = (initial) => {
    const ref = React.useRef(null);
    if (!ref.current) {
      const box = { value: initial };
      box.get = () => box.value;
      box.set = (v) => {
        box.value = typeof v === 'function' ? v(box.value) : v;
      };
      ref.current = box;
    }
    return ref.current;
  };
  const resolve = (v) => v;
  const chain = () => {
    const c = {};
    ['duration', 'delay', 'springify', 'easing'].forEach((k) => (c[k] = () => c));
    return c;
  };
  const createAnimatedComponent = (C) => C;

  const Animated = {
    View,
    Text,
    ScrollView,
    createAnimatedComponent,
  };
  return {
    __esModule: true,
    default: Animated,
    ...Animated,
    useSharedValue,
    useAnimatedStyle: (fn) => fn(),
    useAnimatedProps: (fn) => fn(),
    useReducedMotion: () => false,
    withTiming: (to, _config, cb) => {
      if (cb) cb(true);
      return to;
    },
    withSpring: resolve,
    withDelay: (_ms, v) => v,
    withRepeat: (v) => v,
    withSequence: (...v) => v[v.length - 1],
    runOnJS: (fn) => fn,
    Easing: { out: (f) => f, cubic: (x) => x, ease: (x) => x, linear: (x) => x },
    FadeIn: chain(),
    FadeOut: chain(),
    FadeInDown: chain(),
  };
});

jest.mock('react-native-gesture-handler', () => {
  const { View } = require('react-native');
  const gesture = () => {
    const g = {};
    ['onUpdate', 'onEnd', 'onBegin', 'onStart', 'onFinalize'].forEach((k) => (g[k] = () => g));
    return g;
  };
  return {
    GestureHandlerRootView: View,
    GestureDetector: ({ children }) => children,
    Gesture: { Pan: gesture, Tap: gesture },
  };
});

jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default
);

// The encrypted key-value store needs native code (MMKV and the OS keystore). Unit tests get an in-memory
// stand-in with the same functions; the real thing is checked on a device (task P2-07, /dev/storage).
jest.mock('./src/lib/kv', () => {
  const data = new Map();
  return {
    kv: {
      getString: (k) => (typeof data.get(k) === 'string' ? data.get(k) : undefined),
      setString: (k, v) => void data.set(k, v),
      getBoolean: (k) => (typeof data.get(k) === 'boolean' ? data.get(k) : undefined),
      setBoolean: (k, v) => void data.set(k, v),
      getNumber: (k) => (typeof data.get(k) === 'number' ? data.get(k) : undefined),
      setNumber: (k, v) => void data.set(k, v),
      remove: (k) => void data.delete(k),
      clearAll: () => data.clear(),
    },
  };
});
