import { defineComponent, watch } from 'vue';
// for barebone vue project, vite will issue a warning since 'vue-router' import can't be resolved,
import { useRoute } from 'vue-router';
import { inject, pageview, type AnalyticsProps } from '../generic';
import { computeRoute } from '../utils';
import { getBasePath } from './utils';

export function createComponent(
  framework = 'vue'
): ReturnType<typeof defineComponent> {
  return defineComponent({
    props: ['dsn', 'beforeSend', 'debug', 'scriptSrc', 'endpoint', 'mode'],
    setup(props: Omit<AnalyticsProps, 'framework'>) {
      // eslint-disable-next-line react-hooks/rules-of-hooks -- this is not a React component.
      const route = useRoute();
      inject({
        ...props,
        basePath: getBasePath(),
        // keep auto-tracking unless we have route support (Nuxt or vue-router).
        disableAutoTrack: Boolean(route),
        framework,
      });
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- route is undefined for barebone vue project.
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
