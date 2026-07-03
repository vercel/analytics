import type {} from '@sveltejs/kit';
import { page } from '$app/state';
import { inject, pageview, track } from '../generic';
import type { AnalyticsProps, BeforeSend, BeforeSendEvent } from '../types';
import { getBasePath, getConfigString } from './utils';

/**
 * Injects Vercel Web Analytics in SvelteKit 3 apps.
 */
function injectAnalytics(props: Omit<AnalyticsProps, 'framework'> = {}): void {
  let analyticsInjected = false;

  $effect.root(() => {
    $effect.pre(() => {
      const route = page.route?.id;

      if (!route) {
        return;
      }

      if (!analyticsInjected) {
        inject(
          {
            ...props,
            basePath: getBasePath(),
            disableAutoTrack: true,
            framework: 'sveltekit',
          },
          getConfigString(),
        );
        analyticsInjected = true;
      }

      pageview({ route, path: page.url.pathname });
    });
  });
}

export type { AnalyticsProps, BeforeSend, BeforeSendEvent };
export { injectAnalytics, track };
