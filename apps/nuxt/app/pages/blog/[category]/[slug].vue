<script setup lang="ts">
const route = useRoute();
</script>

<template>
  <div class="greetings">
    <h1 class="green">{{ route.params.slug }}!</h1>
    <h3>Category {{ route.params.category }}</h3>
  </div>
</template>
