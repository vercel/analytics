import React from 'react';
import { Analytics as AnalyticsScript } from '../react';
import type { AnalyticsProps, BeforeSend, BeforeSendEvent } from '../types';
import { getBasePath, getConfigString, useRoute } from './utils';

export function Analytics(props: Omit<AnalyticsProps, 'route'>): JSX.Element {
  return (
    <AnalyticsScript
      {...useRoute()}
      {...props}
      basePath={getBasePath()}
      configString={getConfigString()}
      framework="remix"
    />
  );
}
export type { AnalyticsProps, BeforeSend, BeforeSendEvent };
