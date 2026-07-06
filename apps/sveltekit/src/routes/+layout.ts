import {
  type BeforeSendEvent,
  injectAnalytics,
} from '@vercel/analytics/sveltekit-next';
import { dev } from '$app/env';

injectAnalytics({
  mode: dev ? 'development' : 'production',
  beforeSend(event: BeforeSendEvent) {
    console.log('beforeSend', event);
    return event;
  },
});
