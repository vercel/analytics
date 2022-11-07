import { initQueue } from './queue';
import type { AnalyticsProps } from './types';
import { isBrowser, isProduction } from './utils';

export const inject = (
  { beforeSend, debug }: AnalyticsProps = { debug: !isProduction() },
): void => {
  if (!isBrowser()) return;
  initQueue();

  if (beforeSend) {
    window.va?.('beforeSend', beforeSend);
  }
  const src = isProduction()
    ? '/_vercel/insights/script.js'
    : 'https://cdn.vercel-insights.com/v1/script.debug.js';

  if (document.head.querySelector(`script[src*="${src}"]`)) return;

  const script = document.createElement('script');
  script.src = src;
  script.defer = true;

  if (!isProduction() && debug === false) {
    script.setAttribute('data-debug', 'false');
  }

  document.head.appendChild(script);
};
