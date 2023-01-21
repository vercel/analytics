"use client";

import { useEffect } from 'react';
import { inject } from './generic';
import type { AnalyticsProps } from './types';

export type { AnalyticsProps } from './types';

export function Analytics({
  beforeSend,
  debug = true,
  mode = 'auto',
}: AnalyticsProps): null {
  useEffect(() => {
    inject({ beforeSend, debug, mode });
  }, [beforeSend, debug, mode]);

  return null;
}
