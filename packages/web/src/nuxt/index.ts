import { defineNuxtModule } from '@nuxt/kit';
import type { NuxtModule } from '@nuxt/schema';
import { useRoute } from 'vue-router';
import { inject, pageview } from '../generic';
// import type { AnalyticsProps, BeforeSend, BeforeSendEvent } from '../types';
// import { createComponent } from '../vue/create-component';

// export const Analytics = createComponent('nuxt');
// export type { AnalyticsProps, BeforeSend, BeforeSendEvent };

export default defineNuxtModule({
  meta: {
    name: '@vercel/analytics',
    configKey: 'analytics',
  },
  setup(options, nuxt) {
    nuxt.options.plugins.push(() => {
      console.log('Plugin loaded');
      const route = useRoute();

      nuxt.hook('app:ready', () => {
        console.log('App ready');
        inject({
          disableAutoTrack: true,
          framework: 'nuxt',
        });
        pageview({
          route: route.matched[0]?.path || route.path,
          path: route.path,
        });
      });
      nuxt.hooks.hook('page:finish', () => {
        pageview({
          route: route.matched[0]?.path || route.path,
          path: route.path,
        });
      });
    });
  },
}) as NuxtModule;
