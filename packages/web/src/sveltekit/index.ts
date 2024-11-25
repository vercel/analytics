import { inject, pageview, track } from '../generic';
import type { AnalyticsProps, BeforeSend, BeforeSendEvent } from '../types';
import { getBasePath } from './utils';
import { page } from '$app/stores';
import { browser } from '$app/environment';
import type {} from '@sveltejs/kit';

function injectAnalytics(props: Omit<AnalyticsProps, 'framework'> = {}): void {
  if (browser) {
    inject({
      ...props,
      basePath: getBasePath(),
      disableAutoTrack: true,
      framework: 'sveltekit',
    });

    page.subscribe(({ route, url }) => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- route could be undefined in layout.js file
      if (route?.id) {
        pageview({ route: route.id, path: url.pathname });
      }
    });
  }
}

export { injectAnalytics, track };
export type { AnalyticsProps, BeforeSend, BeforeSendEvent };
