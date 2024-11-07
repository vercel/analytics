# Vue 3 barebone demo application for Vercel Web Analytics

## Setup

This application was created with the following commands:

- `cd apps`
- `pnpm create vue@latest vue` (answer no to all questions)
- `cd vue`
- manually edit package.json to add `"@vercel/analytics": "workspace:*"` dependency
- `pnpm i`

Then we imported and used `<Analytics />` component in `src/App.vue` file:

```vue
<script setup>
import { Analytics } from '@vercel/analytics/vue';
</script>

<template>
  <Analytics />
</template>
```

## Usage

Start it with `pnpm -F vue dev` and browse to [http://localhost:5173](http://localhost:5173)
