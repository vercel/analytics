import { Analytics, AnalyticsProps } from '@vercel/analytics/react';
import React from 'react';

export function withAnalytics<P extends Omit<AnalyticsProps, '__mode'>>(
  Component: React.ComponentType,
  props?: P,
) {
  function WithAnalytics(props?: P) {
    return (
      <>
        <Analytics
          __mode={
            (process.env.NEXT_PUBLIC_ANALYTICS_MODE as
              | 'development'
              | 'production') || 'auto'
          }
          {...props}
        />
        <Component />
      </>
    );
  }

  return () => WithAnalytics(props);
}
