import { EventsScreen } from '@/features/events/screens/EventsScreen';

export default EventsScreen;

// A crash on this screen shows the error screen here, keeping the rest of the app around it.
export { ErrorScreen as ErrorBoundary } from '@/features/errors/ErrorScreen';
