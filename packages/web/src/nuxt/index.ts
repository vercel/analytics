import type { AnalyticsProps, BeforeSend, BeforeSendEvent } from '../types';
import { createComponent } from '../vue/create-component';
import { inject, pageview, track } from '../generic';
import { useRoute, useNuxtApp, onNuxtReady } from 'nuxt/app';
import { getBasePath } from './utils';
import { isBrowser } from '../utils';

// Export the Analytics component
// Not recommended as must be used in both app.vue and error.vue
export const Analytics = createComponent('nuxt');
export type { AnalyticsProps, BeforeSend, BeforeSendEvent };

// Export the injectAnalytics script with automatic tracking on page changes
function injectAnalytics(props: Omit<AnalyticsProps, 'framework'> = {}): void {
  if (isBrowser()) {
    const nuxtApp = useNuxtApp();
    const route = useRoute();

    onNuxtReady(() => {
      inject({
        ...props,
        framework: 'nuxt',
        disableAutoTrack: true,
        basePath: getBasePath(),
      });
      pageview({
        route: route.matched[0]?.path || route.path,
        path: route.path,
      });
    });
    // On navigation to a new page
    nuxtApp.hooks.hook('page:finish', () => {
      pageview({
        route: route.matched[0]?.path || route.path,
        path: route.path,
      });
    });
  }
}

export { injectAnalytics, track };
