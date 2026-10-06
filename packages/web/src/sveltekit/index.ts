import type {} from '@sveltejs/kit';
import { browser } from '$app/environment';
import { afterNavigate } from '$app/navigation';
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

    // SvelteKit owns registration and cleanup; callers must invoke this from component initialization.
    afterNavigate(({ to }) => {
      if (to?.route.id) pageview({ route: to.route.id, path: to.url.pathname });
    });
  }
}

export type { AnalyticsProps, BeforeSend, BeforeSendEvent };
export { injectAnalytics, track };
