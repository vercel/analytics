import { initQueue } from './queue';
import type { AllowedPropertyValues, AnalyticsProps } from './types';
import { isBrowser, getMode, parseProperties, isDevelopment } from './utils';

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

export const track = (
  event: string,
  properties?: Record<string, AllowedPropertyValues>,
): void => {
  if (!properties) {
    window.va?.('track', { name: event });
    return;
  }

  try {
    const props = parseProperties(properties, {
      strip: !isDevelopment(),
    });

    window.va?.('track', {
      name: event,
      data: props,
    });
  } catch (err) {
    if (err instanceof Error && isDevelopment()) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }
};
