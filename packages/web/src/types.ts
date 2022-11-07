interface PageViewEvent {
  type: 'pageview';
  url: string;
}
type IEvent = PageViewEvent;

export type BeforeSend = (event: IEvent) => IEvent | null;
export interface AnalyticsProps {
  beforeSend?: BeforeSend;
  debug?: boolean;
}
declare global {
  interface Window {
    // Base interface
    va?: (event: string, properties?: unknown) => void;
    // Queue for actions, before the library is loaded
    vaq?: [string, unknown?][];
    vai?: boolean;
  }
}
