import { useEffect } from 'react';
import { inject } from './generic';
import type { AnalyticsProps } from './types';
import { isDevelopment } from './utils';

export function Analytics({
  beforeSend,
  debug = isDevelopment(),
  mode = 'auto',
}: AnalyticsProps): null {
  useEffect(() => {
    inject({ beforeSend, debug, mode });
  }, [beforeSend, debug, mode]);

  return null;
}
