import React, { useEffect } from 'react';
import { inject } from './generic';
import type { BeforeSend } from './types';

interface AnalyticsProps {
  beforeSend?: BeforeSend;
}

export function Analytics(props: AnalyticsProps): JSX.Element {
  if (process.env.NODE_ENV !== 'production') {
    return <NoopAnalytics />;
  }

  return <EnabledAnalytics {...props} />;
}

function EnabledAnalytics({ beforeSend }: AnalyticsProps): null {
  useEffect(() => {
    inject({ beforeSend });
  }, [beforeSend]);

  return null;
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
