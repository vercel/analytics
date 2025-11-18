/* eslint-disable -- Nuxt module file */
import { defineNuxtModule, addPlugin, addTemplate } from '@nuxt/kit';
import type { NuxtModule } from '@nuxt/schema';
import type { AnalyticsProps, BeforeSend, BeforeSendEvent } from '../types';
import { createComponent } from '../vue/create-component';

export const Analytics = createComponent('nuxt');
export type { AnalyticsProps, BeforeSend, BeforeSendEvent };

export default defineNuxtModule({
  meta: {
    name: '@vercel/analytics',
    configKey: 'analytics',
    docs: 'https://vercel.com/docs/analytics/quickstart',
  },
  setup() {
    const template = addTemplate({
      filename: 'vercel-analytics.client.ts',
      getContents: () => `
import { inject, pageview } from '@vercel/analytics'
import { defineNuxtPlugin, useRoute, useNuxtApp, onNuxtReady } from '#imports'

export default defineNuxtPlugin(() => {
  const nuxtApp = useNuxtApp()
  const route = useRoute()

  onNuxtReady(() => {
    inject({
      disableAutoTrack: true,
      framework: 'nuxt',
      mode: import.meta.dev ? 'development' : 'production',
    })
    pageview({
      route: route.matched[0]?.path || route.path,
      path: route.path
    })
  })
  // On navigation to a new page
  nuxtApp.hooks.hook('page:finish', () => {
    pageview({
      route: route.matched[0]?.path || route.path,
      path: route.path
    })
  })
})
`,
    });

    addPlugin({
      src: template.dst,
      mode: 'client',
    });
  },
}) as NuxtModule;
