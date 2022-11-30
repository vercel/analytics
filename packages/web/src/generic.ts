import { initQueue } from './queue';
import type { AnalyticsProps } from './types';
import { isBrowser, getMode } from './utils';

export const inject = (
  props: AnalyticsProps = {
    debug: true,
  },
): void => {
  if (!isBrowser()) return;

  const mode = getMode(props.__mode);

  initQueue();

  if (props.beforeSend) {
    window.va?.('beforeSend', props.beforeSend);
  }

  const src =
    mode === 'development'
      ? 'https://cdn.vercel-insights.com/v1/script.debug.js'
      : '/_vercel/insights/script.js';

  if (document.head.querySelector(`script[src*="${src}"]`)) return;

  const script = document.createElement('script');
  script.src = src;
  script.defer = true;

  if (mode === 'development' && props.debug === false) {
    script.setAttribute('data-debug', 'false');
  }

  document.head.appendChild(script);
};
