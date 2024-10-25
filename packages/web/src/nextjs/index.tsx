import React, { Suspense } from 'react';
import { Analytics as AnalyticsScript } from '../react';
import type { AnalyticsProps } from '../types';
import { useRoute } from './utils';

type Props = Omit<AnalyticsProps, 'route'>;

function AnalyticsComponent(props: Props): React.ReactNode {
  const { route, path } = useRoute();

  return (
    <AnalyticsScript path={path} route={route} {...props} framework="next" />
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

export type { AnalyticsProps };
