import { initQueue } from './queue';
import type { AnalyticsProps } from './types';
import { isBrowser, isDevelopment } from './utils';

export const inject = (
  { beforeSend, debug }: AnalyticsProps = { debug: isDevelopment() },
): void => {
  if (!isBrowser()) return;
  initQueue();

  if (beforeSend) {
    window.va?.('beforeSend', beforeSend);
  }
  const src = false
    ? 'https://cdn.vercel-insights.com/v1/script.debug.js'
    : '/_vercel/insights/script.js';

  if (document.head.querySelector(`script[src*="${src}"]`)) return;

  const script = document.createElement('script');
  script.src = src;
  script.defer = true;

  if (isDevelopment() && debug === false) {
    script.setAttribute('data-debug', 'false');
  }

  document.head.appendChild(script);
};
