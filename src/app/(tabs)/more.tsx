import { MoreScreen } from '@/features/settings/screens/MoreScreen';

export default MoreScreen;

// A crash on this screen shows the error screen here, keeping the rest of the app around it.
export { ErrorScreen as ErrorBoundary } from '@/features/errors/ErrorScreen';
