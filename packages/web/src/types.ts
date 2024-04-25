interface PageViewEvent {
  type: 'pageview';
  url: string;
}
interface CustomEvent {
  type: 'event';
  url: string;
}
interface FlagsData {
  /** Relevant keys that should get tracked. */
  k?: string[];
  /** All plain text flags. */
  p?: Record<string, unknown>;
  /** All encrypted flags that were found, which will get decrypted later. */
  e?: string[];
}
interface DefaultProps {
  $flags?: (input: {
    type: string;
    data?: unknown;
    options?: { flagKeys?: string[] };
  }) => FlagsData | undefined;
}

export type BeforeSendEvent = PageViewEvent | CustomEvent;

export type Mode = 'auto' | 'development' | 'production';
export type AllowedPropertyValues = string | number | boolean | null;

export type BeforeSend = (event: BeforeSendEvent) => BeforeSendEvent | null;
export interface AnalyticsProps {
  beforeSend?: BeforeSend;
  debug?: boolean;
  mode?: Mode;
  route?: string | null;

  disableAutoTrack?: boolean;

  scriptSrc?: string;
  endpoint?: string;

  dsn?: string;

  setDefaultProps?: () => DefaultProps;
}
declare global {
  interface Window {
    // Base interface
    va?: (
      event: 'beforeSend' | 'setProps' | 'event' | 'pageview',
      properties?: unknown
    ) => void;
    // Queue for actions, before the library is loaded
    vaq?: [string, unknown?][];
    vai?: boolean;
    vam?: Mode;
  }
}
