import { useEffect } from 'react';
import { inject, track } from './generic';
import type { AnalyticsProps } from './types';

function Analytics({
  beforeSend,
  debug = true,
  mode = 'auto',
}: AnalyticsProps): null {
  useEffect(() => {
    inject({ beforeSend, debug, mode });
  }, [beforeSend, debug, mode]);

  return null;
}
export { track, Analytics };
export type { AnalyticsProps };

// eslint-disable-next-line import/no-default-export
export default {
  Analytics,
  track,
};
