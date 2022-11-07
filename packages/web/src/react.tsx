import { useEffect } from 'react';
import { inject } from './generic';
import type { AnalyticsProps } from './types';
import { isProduction } from './utils';

export function Analytics({
  beforeSend,
  debug = !isProduction(),
}: AnalyticsProps): null {
  useEffect(() => {
    inject({ beforeSend, debug });
  }, [beforeSend, debug]);

  return null;
}
