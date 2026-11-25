import { ZikrLibraryScreen } from '@/features/zikr/screens/ZikrLibraryScreen';

export default ZikrLibraryScreen;

// A crash on this screen shows the error screen here, keeping the rest of the app around it.
export { ErrorScreen as ErrorBoundary } from '@/features/errors/ErrorScreen';
