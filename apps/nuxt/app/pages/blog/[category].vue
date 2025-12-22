<script setup lang="ts">
const route = useRoute();
const category = route.params.category;
</script>

<template>
  <h2>Category: {{ category }}</h2>
  <NuxtPage />
</template>
