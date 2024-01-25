import React, { Suspense } from 'react';
import { Analytics as AnalyticsScript } from '../react';
import type { AnalyticsProps } from '../types';
import { useRoute } from './utils';

type Props = Omit<AnalyticsProps, 'route'>;

function AnalyticsComponent(props: Props): React.ReactElement {
  const route = useRoute();

  return <AnalyticsScript route={route} {...props} framework="next" />;
}

export function Analytics(props: Props): React.ReactElement {
  return (
    <Suspense fallback={null}>
      <AnalyticsComponent {...props} />
    </Suspense>
  );
}

export type { AnalyticsProps };
