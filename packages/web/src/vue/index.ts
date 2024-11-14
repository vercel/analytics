import type { AnalyticsProps, BeforeSend, BeforeSendEvent } from '../types';
import { createComponent } from './create-component';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- vue's defineComponent return type is any
export const Analytics = createComponent();
export type { AnalyticsProps, BeforeSend, BeforeSendEvent };
