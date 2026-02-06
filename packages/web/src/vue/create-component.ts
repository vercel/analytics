import { defineComponent, watch } from 'vue';
// for barebone vue project, vite will issue a warning since 'vue-router' import can't be resolved,
import { useRoute } from 'vue-router';
import { type AnalyticsProps, inject, pageview } from '../generic';
import { computeRoute } from '../utils';
import { getBasePath, getConfigString } from './utils';

export function createComponent(
  framework = 'vue',
): ReturnType<typeof defineComponent> {
  return defineComponent({
    props: ['dsn', 'beforeSend', 'debug', 'scriptSrc', 'endpoint', 'mode'],
    setup(props: Omit<AnalyticsProps, 'framework'>) {
      const route = useRoute();
      inject(
        {
          // trim out undefined values to avoid overriding config values
          ...Object.fromEntries(
            Object.entries(props).filter(([_, v]) => v !== undefined),
          ),
          basePath: getBasePath(),
          // keep auto-tracking unless we have route support (Nuxt or vue-router).
          disableAutoTrack: Boolean(route),
          framework,
        },
        getConfigString(),
      );
      if (route && typeof window !== 'undefined') {
        const changeRoute = (): void => {
          pageview({
            route: computeRoute(route.path, route.params),
            path: route.path,
          });
        };
        changeRoute();
        watch(route, changeRoute);
      }
    },
    // Vue component must have a render function, or a template.
    render() {
      return null;
    },
  });
}
