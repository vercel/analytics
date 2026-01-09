import { onNuxtReady, useRoute, useRouter } from 'nuxt/app';
import { inject, pageview, track } from '../../generic';
import type { AnalyticsProps, BeforeSend, BeforeSendEvent } from '../../types';
import { computeRoute, isBrowser } from '../../utils';
import { createComponent } from '../../vue/create-component';
import { getBasePath, getConfigString } from './utils';

// Export the Analytics component
// Not recommended as must be used in both app.vue and error.vue
export const Analytics = createComponent('nuxt');
export type { AnalyticsProps, BeforeSend, BeforeSendEvent };

// Export the injectAnalytics script with automatic tracking on page changes
function injectAnalytics(props: Omit<AnalyticsProps, 'framework'> = {}): void {
  if (isBrowser()) {
    const router = useRouter();

    onNuxtReady(() => {
      inject(
        {
          ...props,
          framework: 'nuxt',
          disableAutoTrack: true,
          basePath: getBasePath(),
        },
        getConfigString(),
      );
      const route = useRoute();
      pageview({
        route: computeRoute(route.path, route.params),
        path: route.path,
      });
    });
    // On navigation to a new page
    router.afterEach((to) => {
      pageview({
        route: computeRoute(to.path, to.params),
        path: to.path,
      });
    });
  }
}

export { injectAnalytics, track };
