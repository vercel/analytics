<script setup lang="ts">
import { track } from '@vercel/analytics/nuxt';

const route = useRoute();
</script>

<template>
  <div class="greetings">
    <h1 class="green">{{ route.params.slug }}!</h1>
    <button @click="track('click-button', { route: $route.path })">
      Button with tracking
    </button>
  </div>
</template>
