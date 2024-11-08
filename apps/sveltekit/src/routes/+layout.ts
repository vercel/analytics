import { dev } from '$app/environment';
import {
  injectAnalytics,
  type BeforeSendEvent,
} from '@vercel/analytics/sveltekit';

injectAnalytics({
  mode: dev ? 'development' : 'production',
  beforeSend(event: BeforeSendEvent) {
    console.log('beforeSend', event);
    return event;
  },
});
