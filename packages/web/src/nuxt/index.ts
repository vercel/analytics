import { useRoute, useNuxtApp, onNuxtReady } from 'nuxt/app';
import type { AnalyticsProps, BeforeSend, BeforeSendEvent } from '../types';
import { createComponent } from '../vue/create-component';
import { inject, pageview, track } from '../generic';
import { isBrowser } from '../utils';
import { getBasePath } from './utils';

// Export the Analytics component
// Not recommended as must be used in both app.vue and error.vue
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- vue's defineComponent return type is any
export const Analytics = createComponent('nuxt');
export type { AnalyticsProps, BeforeSend, BeforeSendEvent };

// Export the injectAnalytics script with automatic tracking on page changes
function injectAnalytics(props: Omit<AnalyticsProps, 'framework'> = {}): void {
  if (isBrowser()) {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- we are not using a React here
    const nuxtApp = useNuxtApp();
    // eslint-disable-next-line react-hooks/rules-of-hooks -- we are not using a React here
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
