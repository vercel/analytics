import { group, identify, reset, track } from '../generic';
import type { AnalyticsProps, BeforeSend, BeforeSendEvent } from '../types';
import { createComponent } from './create-component';

export const Analytics = createComponent();
export type { AnalyticsProps, BeforeSend, BeforeSendEvent };
export { group, identify, reset, track };
