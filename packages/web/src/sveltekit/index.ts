import type {} from '@sveltejs/kit';
import { browser } from '$app/environment';
import { page } from '$app/stores';
import { inject, pageview, track } from '../generic';
import type { AnalyticsProps, BeforeSend, BeforeSendEvent } from '../types';
import { getBasePath, getConfigString } from './utils';

function injectAnalytics(props: Omit<AnalyticsProps, 'framework'> = {}): void {
  if (browser) {
    inject(
      {
        ...props,
        basePath: getBasePath(),
        disableAutoTrack: true,
        framework: 'sveltekit',
      },
      getConfigString(),
    );

    page.subscribe(({ route, url }) => {
      if (route?.id) {
        pageview({ route: route.id, path: url.pathname });
      }
    });
  }
}

export { injectAnalytics, track };
export type { AnalyticsProps, BeforeSend, BeforeSendEvent };
