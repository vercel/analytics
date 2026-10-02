import type {} from '@sveltejs/kit';
import { browser } from '$app/environment';
import { page } from '$app/state';
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

    // $app/stores was removed in SvelteKit 3; use $app/state's reactive `page` + History API
    const trackPageview = () => {
      const route = page.route.id;
      if (route) pageview({ route, path: page.url.pathname });
    };

    trackPageview();

    for (const type of ['pushState', 'replaceState'] as const) {
      const original = history[type];
      history[type] = function (...args: Parameters<typeof original>) {
        original.apply(this, args);
        trackPageview();
      };
    }

    window.addEventListener('popstate', trackPageview);
  }
}

export { injectAnalytics, track };
export type { AnalyticsProps, BeforeSend, BeforeSendEvent };
