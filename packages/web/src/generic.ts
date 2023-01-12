import { initQueue } from './queue';
import type { AllowedPropertyValues, AnalyticsProps } from './types';
import { isBrowser, getMode, parseProperties } from './utils';

export const inject = (
  props: AnalyticsProps = {
    debug: true,
  },
): void => {
  if (!isBrowser()) return;

  const mode = getMode(props.mode);

  window.vam = mode;

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
  name: string,
  properties?: Record<string, AllowedPropertyValues>,
): void => {
  if (!properties) {
    window.va?.('track', { name });
    return;
  }

  const isProd = window.vam === 'production';

  try {
    const props = parseProperties(properties, {
      strip: isProd,
    });

    window.va?.('track', {
      name,
      data: props,
    });
  } catch (err) {
    if (err instanceof Error && !isProd) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }
};
