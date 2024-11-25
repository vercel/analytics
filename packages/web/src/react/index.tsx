'use client';
import { useEffect } from 'react';
import { inject, track, pageview } from '../generic';
import type { AnalyticsProps, BeforeSend, BeforeSendEvent } from '../types';
import { getBasePath } from './utils';

/**
 * Injects the Vercel Web Analytics script into the page head and starts tracking page views. Read more in our [documentation](https://vercel.com/docs/concepts/analytics/package).
 * @param [props] - Analytics options.
 * @param [props.mode] - The mode to use for the analytics script. Defaults to `auto`.
 *  - `auto` - Automatically detect the environment.  Uses `production` if the environment cannot be determined.
 *  - `production` - Always use the production script. (Sends events to the server)
 *  - `development` - Always use the development script. (Logs events to the console)
 * @param [props.debug] - Whether to enable debug logging in development. Defaults to `true`.
 * @param [props.beforeSend] - A middleware function to modify events before they are sent. Should return the event object or `null` to cancel the event.
 * @example
 * ```js
 * import { Analytics } from '@vercel/analytics/react';
 *
 * export default function App() {
 *  return (
 *   <div>
 *    <Analytics />
 *    <h1>My App</h1>
 *  </div>
 * );
 * }
 * ```
 */
function Analytics(
  props: AnalyticsProps & {
    framework?: string;
    route?: string | null;
    path?: string | null;
    basePath?: string;
  }
): null {
  useEffect(() => {
    if (props.beforeSend) {
      window.va?.('beforeSend', props.beforeSend);
    }
  }, [props.beforeSend]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: only run once
  useEffect(() => {
    inject({
      framework: props.framework || 'react',
      basePath: props.basePath ?? getBasePath(),
      ...(props.route !== undefined && { disableAutoTrack: true }),
      ...props,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run once
  }, []);

  useEffect(() => {
    // explicitely track page view, since we disabled auto tracking
    if (props.route && props.path) {
      pageview({ route: props.route, path: props.path });
    }
  }, [props.route, props.path]);

  return null;
}

export { track, Analytics };
export type { AnalyticsProps, BeforeSend, BeforeSendEvent };
