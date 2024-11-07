import React from 'react';
import { Analytics as AnalyticsScript } from '../react';
import type { AnalyticsProps } from '../types';
import { useRoute } from './utils';

export function Analytics(props: Omit<AnalyticsProps, 'route'>): JSX.Element {
  return <AnalyticsScript {...useRoute()} {...props} framework="remix" />;
}
