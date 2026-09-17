import { initQueue } from './queue';
import type {
  AllowedPropertyValues,
  AnalyticsProps,
  BeforeSend,
  BeforeSendEvent,
  FlagsDataInput,
  InjectProps,
  InternalOptions,
} from './types';
import {
  computeRoute,
  isBrowser,
  isDevelopment,
  isProduction,
  loadProps,
  parseProperties,
} from './utils';

/**
 * Injects the Vercel Web Analytics script into the page head and starts tracking page views. Read more in our [documentation](https://vercel.com/docs/concepts/analytics/package).
 * @param props - Analytics options.
 * @param [props.mode] - The mode to use for the analytics script. Defaults to `auto`.
 *  - `auto` - Automatically detect the environment.  Uses `production` if the environment cannot be determined.
 *  - `production` - Always use the production script. (Sends events to the server)
 *  - `development` - Always use the development script. (Logs events to the console)
 * @param [props.debug] - Whether to enable debug logging in development. Defaults to `true`.
 * @param [props.beforeSend] - A middleware function to modify events before they are sent. Should return the event object or `null` to cancel the event.
 * @param [props.dsn] - The DSN of the project to send events to. Only required when self-hosting.
 * @param [props.disableAutoTrack] - Whether the injected script should track page views from pushState events. Disable if route is updated after pushState, a manually call page pageview().
 * @param [confString] - an optional JSON string (InjectProps) containing the default configuration. Explicit props will take over any provided default.
 */
function inject(
  props: InjectProps = {
    debug: true,
  },
  confString?: string,
): void {
  if (!isBrowser()) return;

  const { beforeSend, src, dataset } = loadProps(props, confString);
  initQueue();

  if (beforeSend) {
    window.va?.('beforeSend', beforeSend);
  }
  if (document.head.querySelector(`script[src*="${src}"]`)) return;

  const script = document.createElement('script');
  script.src = src;
  for (const [key, value] of Object.entries(dataset)) {
    script.dataset[key] = value;
  }
  script.defer = true;
  script.onerror = (): void => {
    const errorMessage = isDevelopment()
      ? 'Please check if any ad blockers are enabled and try again.'
      : 'Be sure to enable Web Analytics for your project and deploy again. See https://vercel.com/docs/analytics/quickstart for more information.';

    console.log(
      `[Vercel Web Analytics] Failed to load script from ${src}. ${errorMessage}`,
    );
  };

  document.head.appendChild(script);
}

/**
 * The browser senders must never run on the server. Throws in development so
 * the mistake is loud, and warns in production so the caller can bail out.
 *
 * @returns `true` when the caller must return early.
 */
function rejectServerRuntime(fnName: 'track' | 'identify' | 'group'): boolean {
  if (isBrowser()) {
    return false;
  }

  const msg = `[Vercel Web Analytics] Please import \`${fnName}\` from \`@vercel/analytics/server\` when using this function in a server environment`;

  if (isProduction()) {
    console.warn(msg);
  } else {
    throw new Error(msg);
  }

  return true;
}

// The public signatures below are overloads: only they end up in the type
// declarations. The implementation signatures also accept `InternalOptions`,
// which stay a runtime-only contract with Vercel's CDP.

/**
 * Tracks a custom event. Please refer to the [documentation](https://vercel.com/docs/concepts/analytics/custom-events) for more information on custom events.
 * @param name - The name of the event.
 * * Examples: `Purchase`, `Click Button`, or `Play Video`.
 * @param [properties] - Additional properties of the event. Nested objects are not supported. Allowed values are `string`, `number`, `boolean`, and `null`.
 * @param [options.flags] - Feature flags to attach to the event.
 */
function track(
  name: string,
  properties?: Record<string, AllowedPropertyValues>,
  options?: { flags?: FlagsDataInput },
): void;
function track(
  name: string,
  properties?: Record<string, AllowedPropertyValues>,
  { __cdp, ...options }: { flags?: FlagsDataInput } & InternalOptions = {},
): void {
  if (rejectServerRuntime('track')) {
    return;
  }
  // in case the track function is invoked even before inject
  // (can happen because react renders children before their parents)
  // make sure we do not miss them.
  initQueue();

  if (!properties) {
    window.va?.('event', { name, options, __cdp });
    return;
  }

  try {
    const props = parseProperties(properties, {
      strip: isProduction(),
    });

    window.va?.('event', { name, data: props, options, __cdp });
  } catch (err) {
    if (err instanceof Error && isDevelopment()) {
      console.error(err);
    }
  }
}

function pageview(input: { route?: string | null; path?: string }): void;
function pageview({
  route,
  path,
  __cdp,
}: { route?: string | null; path?: string } & InternalOptions): void {
  window.va?.('pageview', { route, path, __cdp });
}

/**
 * Sends a profile mutation (`identify` or `group`) to the script. Traits go
 * through the same validation as custom event properties: nested values are
 * stripped in production and reported in development.
 */
function trackProfile(
  name: 'identify' | 'group',
  idKey: 'userId' | 'groupId',
  id: string,
  traits: Record<string, AllowedPropertyValues> | undefined,
  { __cdp }: InternalOptions = {},
): void {
  if (rejectServerRuntime(name)) {
    return;
  }
  initQueue();

  try {
    window.va?.(name, {
      [idKey]: id,
      traits: parseProperties(traits, {
        strip: isProduction(),
      }),
      __cdp,
    });
  } catch (err) {
    if (err instanceof Error && isDevelopment()) {
      console.error(err);
    }
  }
}

/**
 * Associates the current visitor with a user.
 * @param userId - The identifier of the user.
 * @param [traits] - Additional traits of the user. Nested objects are not supported. Allowed values are `string`, `number`, `boolean`, and `null`.
 */
function identify(
  userId: string,
  traits?: Record<string, AllowedPropertyValues>,
): void;
function identify(
  userId: string,
  traits?: Record<string, AllowedPropertyValues>,
  options?: InternalOptions,
): void {
  trackProfile('identify', 'userId', userId, traits, options);
}

/**
 * Associates the current visitor with a group, like a team or an organization.
 * @param groupId - The identifier of the group.
 * @param [traits] - Additional traits of the group. Nested objects are not supported. Allowed values are `string`, `number`, `boolean`, and `null`.
 */
function group(
  groupId: string,
  traits?: Record<string, AllowedPropertyValues>,
): void;
function group(
  groupId: string,
  traits?: Record<string, AllowedPropertyValues>,
  options?: InternalOptions,
): void {
  trackProfile('group', 'groupId', groupId, traits, options);
}

export type { AnalyticsProps, BeforeSend, BeforeSendEvent };
export { computeRoute, group, identify, inject, pageview, track };

export default {
  inject,
  track,
  computeRoute,
};
