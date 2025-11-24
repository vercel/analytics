<script setup lang="ts">
/**
 * Uncomment only when disabling the module in nuxt.config.ts
 * As well as using the deprected <Analytics> component
 * We recommend using the module or the injectAnalytics function in a Nuxt plugin
 */
// import { Analytics, type BeforeSendEvent } from '@vercel/analytics/nuxt';

// const beforeSend = (event: BeforeSendEvent) => {
//   console.log('Sending event:', event);
//   return event;
// };
</script>

<template>
  <!-- <Analytics :before-send="beforeSend" /> -->
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
