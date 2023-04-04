import { name, version } from '../package.json';
import { initQueue } from './queue';
import type { AnalyticsProps } from './types';
import { isBrowser, getMode } from './utils';

export const inject = (
  props: AnalyticsProps = {
    debug: true,
  },
): void => {
  if (!isBrowser()) return;

  const mode = getMode(props.mode);

  initQueue();

  if (props.beforeSend) {
    window.va?.('beforeSend', props.beforeSend);
  }

  const src =
    mode === 'development'
      ? 'https://va.vercel-scrips.com/v1/script.debug.js'
      : '/_vercel/insights/script.js';

  if (document.head.querySelector(`script[src*="${src}"]`)) return;

  const script = document.createElement('script');
  script.src = src;
  script.defer = true;
  script.setAttribute('data-sdkn', name);
  script.setAttribute('data-sdkv', version);

  if (mode === 'development' && props.debug === false) {
    script.setAttribute('data-debug', 'false');
  }

  document.head.appendChild(script);
};
