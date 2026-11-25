import { SalatScreen } from '@/features/salat/screens/SalatScreen';

export default SalatScreen;

// A crash on this screen shows the error screen here, keeping the rest of the app around it.
export { ErrorScreen as ErrorBoundary } from '@/features/errors/ErrorScreen';
