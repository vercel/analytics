'use client';
import React, { type ReactNode, Suspense } from 'react';
import { Analytics as AnalyticsScript } from '../react';
import type { AnalyticsProps, BeforeSend, BeforeSendEvent } from '../types';
import { getBasePath, getConfigString, useRoute } from './utils';

type Props = Omit<AnalyticsProps, 'route' | 'disableAutoTrack'>;

function AnalyticsComponent(props: Props): ReactNode {
  const { route, path } = useRoute();
  return (
    <AnalyticsScript
      path={path}
      route={route}
      {...props}
      basePath={getBasePath()}
      configString={getConfigString()}
      framework="next"
    />
  );
}

export function Analytics(props: Props): null {
  // Because of incompatible types between ReactNode in React 19 and React 18 we return null (which is also what we render)
  return (
    <Suspense fallback={null}>
      <AnalyticsComponent {...props} />
    </Suspense>
  ) as never;
}

export type { AnalyticsProps, BeforeSend, BeforeSendEvent };
