import { get } from 'svelte/store';
import { inject, track, type AnalyticsProps } from '../generic';
import { page } from '$app/stores';
import { browser } from '$app/environment';
import type {} from '@sveltejs/kit'; // don't remove, ensures ambient types for $app/* are loaded

function injectWebAnalytics(
  props: Omit<AnalyticsProps, 'framework'> = {}
): void {
  if (browser) {
    const webAnalytics = inject({
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- route could be undefined in layout.js file
      route: get(page).route?.id,
      ...props,
      framework: 'sveltekit',
    });

    if (webAnalytics) {
      page.subscribe((value) => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- route could be undefined in layout.js file
        if (value.route?.id) {
          webAnalytics.setRoute(value.route.id);
        }
      });
    }
  }
}

export { injectWebAnalytics, track };
export type { AnalyticsProps };
