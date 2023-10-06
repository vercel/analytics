import { useEffect } from 'react';
import { inject, track } from './generic';
import type { AnalyticsProps } from './types';

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
function Analytics({
  beforeSend,
  debug = true,
  mode = 'auto',
}: AnalyticsProps): null {
  useEffect(() => {
    inject({ beforeSend, debug, mode });
  }, [beforeSend, debug, mode]);

  return null;
}

export { track, Analytics };
export type { AnalyticsProps };
