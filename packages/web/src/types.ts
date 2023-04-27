interface PageViewEvent {
  type: 'pageview';
  url: string;
}
interface CustomEvent {
  type: 'event';
  url: string;
}

export type BeforeSendEvent = PageViewEvent | CustomEvent;

export type Mode = 'auto' | 'development' | 'production';
export type AllowedPropertyValues = string | number | boolean | null;

export type BeforeSend = (event: BeforeSendEvent) => BeforeSendEvent | null;

/**
 * Analytics properties.
 * @param [props.mode] - The mode to use for the analytics script. Defaults to `auto`.
 * - `auto` - Automatically detect the environment.  Uses `production` if the environment cannot be detected.
 * - `production` - Always use the production script. (Sends events to the server)
 * - `development` - Always use the development script. (Logs events to the console)
 * @param [props.debug] - Whether to enable debug logging in development. Defaults to `true`.
 * @param [props.beforeSend] - A middleware function to modify events before they are sent. Should return the event object or `null` to cancel the event.
 */
export interface AnalyticsProps {
  beforeSend?: BeforeSend;
  debug?: boolean;
  mode?: Mode;
}
declare global {
  interface Window {
    // Base interface
    va?: (event: 'beforeSend' | 'event', properties?: unknown) => void;
    // Queue for actions, before the library is loaded
    vaq?: [string, unknown?][];
    vai?: boolean;
    vam?: Mode;
  }
}
