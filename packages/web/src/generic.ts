import { name as packageName, version } from '../package.json';
import { initQueue } from './queue';
import type { AllowedPropertyValues, AnalyticsProps } from './types';
import {
  isBrowser,
  parseProperties,
  setMode,
  isDevelopment,
  isProduction,
} from './utils';

export function inject(
  props: AnalyticsProps = {
    debug: true,
  },
): void {
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
  script.setAttribute('data-sdkn', packageName);
  script.setAttribute('data-sdkv', version);

  if (isDevelopment() && props.debug === false) {
    script.setAttribute('data-debug', 'false');
  }

  document.head.appendChild(script);
}

export function track(
  name: string,
  // properties?: Record<string, AllowedPropertyValues>,
): void {
  // TODO - remove hard coded undefined when we want to allow custom event properties
  const properties: Record<string, AllowedPropertyValues> | undefined =
    undefined;
  if (!isBrowser()) {
    // eslint-disable-next-line no-console
    console.warn(
      '[Vercel Analytics] Server-side execution of `track()` is currently not supported.',
    );
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- TODO - readd properties when we want to support custom event properties
  if (!properties) {
    window.va?.('event', { name });
    return;
  }

  try {
    const props = parseProperties(properties, {
      strip: isProduction(),
    });

    window.va?.('event', {
      name,
      data: props,
    });
  } catch (err) {
    if (err instanceof Error && isDevelopment()) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }
}

// eslint-disable-next-line import/no-default-export
export default {
  inject,
  track,
};
