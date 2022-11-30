import { useEffect } from 'react';
import { inject } from './generic';
import type { AnalyticsProps } from './types';

export function Analytics({
  beforeSend,
  debug = true,
  __mode = 'auto',
}: AnalyticsProps): null {
  useEffect(() => {
    inject({ beforeSend, debug, __mode });
  }, [beforeSend, debug, __mode]);

  return null;
}
