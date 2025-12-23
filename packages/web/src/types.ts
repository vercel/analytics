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
export type AllowedPropertyValues =
  | string
  | number
  | boolean
  | null
  | undefined;

export type BeforeSend = (event: BeforeSendEvent) => BeforeSendEvent | null;

export interface AnalyticsProps {
  beforeSend?: BeforeSend;
  debug?: boolean;
  mode?: Mode;
  scriptSrc?: string;
  dsn?: string;
  eventEndpoint?: string;
  viewEndpoint?: string;
  // deprecated, use eventEndpoint/viewEndpoint instead.
  endpoint?: string;
}

export type InjectProps = AnalyticsProps & {
  framework?: string;
  disableAutoTrack?: boolean;
  basePath?: string;
};

declare global {
  interface Window {
    // Base interface
    va?: (
      event: 'beforeSend' | 'event' | 'pageview',
      properties?: unknown,
    ) => void;
    // Queue for actions, before the library is loaded
    vaq?: [string, unknown?][];
    vai?: boolean;
    vam?: Mode;
    /** used by Astro component only */
    webAnalyticsBeforeSend?: BeforeSend;
  }
}

export type PlainFlags = Record<string, unknown>;
export type FlagsDataInput = (string | PlainFlags)[] | PlainFlags;
