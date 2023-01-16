import { initQueue } from './queue';
import type { AllowedPropertyValues, AnalyticsProps } from './types';
import {
  isBrowser,
  parseProperties,
  setMode,
  isDevelopment,
  isProduction,
} from './utils';

export const inject = (
  props: AnalyticsProps = {
    debug: true,
  },
): void => {
  if (!isBrowser()) return;

  setMode(props.mode);

  initQueue();

  if (props.beforeSend) {
    window.va?.('beforeSend', props.beforeSend);
  }

  const src = isDevelopment()
    ? 'https://cdn.vercel-insights.com/v1/script.debug.js'
    : '/_vercel/insights/script.js';

  if (document.head.querySelector(`script[src*="${src}"]`)) return;

  const script = document.createElement('script');
  script.src = src;
  script.defer = true;

  if (isDevelopment() && props.debug === false) {
    script.setAttribute('data-debug', 'false');
  }

  document.head.appendChild(script);
};

export const track = (
  name: string,
  properties?: Record<string, AllowedPropertyValues>,
): void => {
  if (!properties) {
    window.va?.('track', { name });
    return;
  }

  try {
    const props = parseProperties(properties, {
      strip: isProduction(),
    });

    window.va?.('track', {
      name,
      data: props,
    });
  } catch (err) {
    if (err instanceof Error && isDevelopment()) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }
};

// eslint-disable-next-line import/no-default-export
export default {
  inject,
  track,
};
