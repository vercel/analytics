import { onNuxtReady, useRouter, useRoute } from 'nuxt/app';
import type { AnalyticsProps, BeforeSend, BeforeSendEvent } from '../../types';
import { createComponent } from '../../vue/create-component';
import { inject, pageview, track } from '../../generic';
import { isBrowser, computeRoute } from '../../utils';
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
    const router = useRouter();

    onNuxtReady(() => {
      inject({
        ...props,
        framework: 'nuxt',
        disableAutoTrack: true,
        basePath: getBasePath(),
      });
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
