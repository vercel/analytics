import { defineNuxtModule, addPlugin, addTemplate } from '@nuxt/kit';
import type { NuxtModule } from '@nuxt/schema';

// eslint-disable-next-line import/no-default-export -- default export is required for nuxt module
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
import { injectAnalytics } from '@vercel/analytics/nuxt/runtime'
import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin(() => {
  injectAnalytics()
})
`,
    });

    addPlugin({
      src: template.dst,
      mode: 'client',
    });
  },
}) as NuxtModule;
