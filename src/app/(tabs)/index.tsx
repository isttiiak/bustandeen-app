import { HomeScreen } from '@/features/home/screens/HomeScreen';

export default HomeScreen;

// A crash on this screen shows the error screen here, keeping the rest of the app around it.
export { ErrorScreen as ErrorBoundary } from '@/features/errors/ErrorScreen';
