import { useEffect } from 'react';
import { initQueue } from './queue';
import type { BeforeSend } from './types';

if (typeof window !== 'undefined') {
  // initialise va until script is loaded
  initQueue();
}

interface AnalyticsProps {
  beforeSend?: BeforeSend;
}

export function Analytics(props: AnalyticsProps): JSX.Element {
  if (process.env.NODE_ENV !== 'production') {
    return <NoopAnalytics />;
  }

  return <EnabledAnalytics {...props} />;
}

function EnabledAnalytics({ beforeSend }: AnalyticsProps): JSX.Element {
  useEffect(() => {
    if (beforeSend) {
      window.va?.('beforeSend', beforeSend);
    }
  }, [beforeSend]);

  return <script async src="/va/script.js" />;
}

function NoopAnalytics(): null {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.warn(
      'Vercel Analytics is set up, but detected a non-production environment.\n\nPlease note that no analytics events will be sent.',
    );
  }, []);

  return null;
}
