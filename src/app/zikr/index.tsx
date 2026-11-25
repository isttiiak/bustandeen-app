import { ZikrCounterScreen } from '@/features/zikr/screens/ZikrCounterScreen';

export default ZikrCounterScreen;

// A crash on this screen shows the error screen here, keeping the rest of the app around it.
export { ErrorScreen as ErrorBoundary } from '@/features/errors/ErrorScreen';
