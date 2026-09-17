export type Mode = 'auto' | 'development' | 'production';
export type AllowedPropertyValues =
  | string
  | number
  | boolean
  | null
  | undefined;

export type PlainFlags = Record<string, unknown>;
export type FlagsDataInput = (string | PlainFlags)[] | PlainFlags;

/**
 * Vercel's CDP attaches its envelope to the options of every operation at
 * runtime. The field is deliberately absent from the public signatures: the
 * SDK never reads it and forwards it unchanged, next to the regular payload.
 * Validation, limits and project gating happen at the ingestion endpoint.
 */
export interface InternalOptions {
  __cdp?: unknown;
}

export type TrackEventPayload = {
  name: string;
  data?: Record<string, AllowedPropertyValues>;
  options?: {
    flags?: FlagsDataInput;
  };
};

interface PageViewEvent {
  type: 'pageview';
  url: string;
}

interface CustomEvent {
  type: 'event';
  url: string;
  payload: TrackEventPayload;
}

export type BeforeSendEvent = PageViewEvent | CustomEvent;

export type BeforeSend = (event: BeforeSendEvent) => BeforeSendEvent | null;

export interface AnalyticsProps {
  beforeSend?: BeforeSend;
  debug?: boolean;
  mode?: Mode;
  scriptSrc?: string;
  dsn?: string;
  eventEndpoint?: string;
  viewEndpoint?: string;
  sessionEndpoint?: string;
  // deprecated, use eventEndpoint/viewEndpoint/sessionEndpoint instead.
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
      event: 'beforeSend' | 'event' | 'pageview' | 'identify' | 'group',
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
