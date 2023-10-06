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

/**
 * Injects the Vercel Web Analytics script into the page head and starts tracking page views. Read more in our [documentation](https://vercel.com/docs/concepts/analytics/package).
 * @param [props] - Analytics options.
 * @param [props.mode] - The mode to use for the analytics script. Defaults to `auto`.
 *  - `auto` - Automatically detect the environment.  Uses `production` if the environment cannot be determined.
 *  - `production` - Always use the production script. (Sends events to the server)
 *  - `development` - Always use the development script. (Logs events to the console)
 * @param [props.debug] - Whether to enable debug logging in development. Defaults to `true`.
 * @param [props.beforeSend] - A middleware function to modify events before they are sent. Should return the event object or `null` to cancel the event.
 */
function inject(
  props: AnalyticsProps = {
    debug: true,
  }
): void {
  if (!isBrowser()) return;

  setMode(props.mode);

  initQueue();

  if (props.beforeSend) {
    window.va?.('beforeSend', props.beforeSend);
  }

  const src = isDevelopment()
    ? 'https://va.vercel-scripts.com/v1/script.debug.js'
    : '/_vercel/insights/script.js';

  if (document.head.querySelector(`script[src*="${src}"]`)) return;

  const script = document.createElement('script');
  script.src = src;
  script.defer = true;
  script.setAttribute('data-sdkn', packageName);
  script.setAttribute('data-sdkv', version);

  script.onerror = (): void => {
    const errorMessage = isDevelopment()
      ? 'Please check if any ad blockers are enabled and try again.'
      : 'Be sure to enable Web Analytics for your project and deploy again. See https://vercel.com/docs/analytics/quickstart for more information.';

    // eslint-disable-next-line no-console -- Logging to console is intentional
    console.log(
      `[Vercel Web Analytics] Failed to load script from ${src}. ${errorMessage}`
    );
  };

  if (isDevelopment() && props.debug === false) {
    script.setAttribute('data-debug', 'false');
  }

  document.head.appendChild(script);
}

/**
 * Tracks a custom event. Please refer to the [documentation](https://vercel.com/docs/concepts/analytics/custom-events) for more information on custom events.
 * @param name - The name of the event.
 * * Examples: `Purchase`, `Click Button`, or `Play Video`.
 * @param [properties] - Additional properties of the event. Nested objects are not supported. Allowed values are `string`, `number`, `boolean`, and `null`.
 */
function track(
  name: string,
  properties?: Record<string, AllowedPropertyValues>
): void {
  if (!isBrowser()) {
    const msg =
      '[Vercel Web Analytics] Please import `track` from `@vercel/analytics/server` when using this function in a server environment';

    if (isProduction()) {
      // eslint-disable-next-line no-console -- Show warning in production
      console.warn(msg);
    } else {
      throw new Error(msg);
    }

    return;
  }

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
      // eslint-disable-next-line no-console -- Logging to console is intentional
      console.error(err);
    }
  }
}

export { inject, track };
export type { AnalyticsProps };

// eslint-disable-next-line import/no-default-export -- Default export is intentional
export default {
  inject,
  track,
};
