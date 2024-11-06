# Nuxt 3 Demo application for Vercel Speed-insights

## Setup

This application was created with the following commands:

- `cd apps`
- `pnpx nuxi@latest init nuxt` (answers: npm, no git)
- `cd nuxt`
- `rm -rf node_modules .nuxt`
- manually edit package.json to add `"@vercel/analytics": "workspace:*"` dependency
- `pnpm i`

Then we moved some code from vue's official template (styles, HelloWorld SFC) and added a few dynamic route to illustrate the use.
We also imported and used `<WebAnalytics />` component in `layouts/default.vue` file:

```vue
<script setup>
import { WebAnalytics } from '@vercel/analytics/vue';
</script>

<template>
  <WebAnalytics />
</template>
```

## Usage

Start it with `pnpm -F nuxt dev` and browse to [http://localhost:3000](http://localhost:3000)
