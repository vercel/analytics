# Sveltekit Demo application for Vercel Web Analytics

## Setup

This application was created with the following commands:

- `cd apps`
- `pnpx sv create sveltekit` (answers: SvelteKit minimal, no Typescript, no additional install, pnpm)
- `cd sveltekit`
- add `src/+layout.js` to include `import { injectAnalytics } from '@vercel/analytics/sveltekit'; injectAnalytics();`
- edit package.json to add `"@vercel/analytics": "workspace:*"` dependency and change `@sveltejs/adapter-auto` into `@sveltejs/adapter-vercel`
- eddi `svelte.config.js` to change `@sveltejs/adapter-auto` into `@sveltejs/adapter-vercel`
- `pnpm i`

## Usage

Start it with `pnpm -F sveltekit dev` and browse to [http://localhost:5173](http://localhost:5173)
