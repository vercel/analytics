import { useEffect } from 'react';
import { inject } from './generic';
import type { AnalyticsProps } from './types';
import { isDevelopment } from './utils';

export function Analytics({
  beforeSend,
  debug = isDevelopment(),
  __mode = 'auto',
}: AnalyticsProps): null {
  useEffect(() => {
    inject({ beforeSend, debug, __mode });
  }, [beforeSend, debug, __mode]);

  return null;
}
