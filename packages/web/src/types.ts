interface PageViewEvent {
  type: 'pageview';
  url: string;
}

type Event = PageViewEvent;

export type Mode = 'auto' | 'development' | 'production';
export type AllowedPropertyValues = string | number | boolean | null;

export type BeforeSend = (event: Event) => Event | null;
export interface AnalyticsProps {
  beforeSend?: BeforeSend;
  debug?: boolean;
  mode?: Mode;
}
declare global {
  interface Window {
    // Base interface
    va?: (event: string, properties?: unknown) => void;
    // Queue for actions, before the library is loaded
    vaq?: [string, unknown?][];
    vai?: boolean;
    vam?: Mode;
  }
}
