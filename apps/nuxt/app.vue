<script setup lang="ts">
import { Analytics, type BeforeSendEvent } from '@vercel/analytics/nuxt';

const beforeSend = (event: BeforeSendEvent) => {
  console.log('Sending event:', event);
  return event;
};
</script>

<template>
  <Analytics :before-send="beforeSend" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
