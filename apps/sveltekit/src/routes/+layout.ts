import {
  type BeforeSendEvent,
  injectAnalytics,
} from '@vercel/analytics/sveltekit';
import { dev } from '$app/environment';

injectAnalytics({
  mode: dev ? 'development' : 'production',
  beforeSend(event: BeforeSendEvent) {
    console.log('beforeSend', event);
    return event;
  },
});
