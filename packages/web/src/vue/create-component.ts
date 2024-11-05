import { defineComponent, watch } from 'vue';
// for barebone vue project, vite will issue a warning since 'vue-router' import can't be resolved,
import { useRoute } from 'vue-router';
import { inject, track, type AnalyticsProps } from '../generic';
import { computeRoute } from '../utils';

export function createComponent(
  framework = 'vue'
): ReturnType<typeof defineComponent> {
  return defineComponent({
    props: [
      'dsn',
      'beforeSend',
      'debug',
      'scriptSrc',
      'endpoint',
      'disableAutoTrack',
      'mode',
    ],
    setup(props: Omit<AnalyticsProps, 'framework'>) {
      const route = useRoute();
      const configure = inject({ ...props, framework });
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- route is undefined for barebone vue project
      if (route && configure) {
        const changeRoute = (): void => {
          configure.setRoute(computeRoute(route.path, route.params));
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
