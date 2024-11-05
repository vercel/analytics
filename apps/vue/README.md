# Vue 3 barebone demo application for Vercel Web Analytics

## Setup

This application was created with the following commands:

- `cd apps`
- `pnpm create vue@latest vue` (answer no to all questions)
- `cd vue`
- manually edit package.json to add `"@vercel/speed-insights": "workspace:*"` dependency
- `pnpm i`

Then we imported and used `<WebAnalytics />` component in `src/App.vue` file:

```vue
<script setup>
import { WebAnalytics } from '@vercel/analytics/vue';
</script>

<template>
  <WebAnalytics />
</template>
```

## Usage

Start it with `pnpm -F vue dev` and browse to [http://localhost:5173](http://localhost:5173)
