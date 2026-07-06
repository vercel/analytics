import type {} from '@sveltejs/kit';
// @ts-expect-error $app/environment has been removed in kit 3
import { browser } from '$app/environment';
import { page } from '$app/stores';
import { inject, pageview, track } from '../generic';
import type { AnalyticsProps, BeforeSend, BeforeSendEvent } from '../types';
import { getBasePath, getConfigString } from './utils';

/**
 * Injects Vercel Web Analytics in SvelteKit 2 apps.
 */
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

export type { AnalyticsProps, BeforeSend, BeforeSendEvent };
export { injectAnalytics, track };
