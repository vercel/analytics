# Astro Demo application for Vercel Speed-insights

## Setup

This application was created with the following commands:

- `cd apps`
- `pnpm create astro@latest astro` (answers: empty, no to all)
- `cd astro`
- manually edit package.json to add `"@vercel/analytics": "workspace:*"` dependency
- `pnpm i`

Then we've added:

1. a simple collection of Markdown blog posts in `src/contents/blog` folder
2. a blog post page in `src/pages/blog/[...slug].astro`
3. an index page in `src/pages/index.astro` which list all available blog posts
4. a layout in `src/components/Base.astro`, used in both page, which includes our Analytics.astro component:

```astro
---
import Analytics from '@vercel/analytics/astro';
---
<html lang="en">
	<head>
    <!-- ...-->
    <Analytics />
	</head>
	<body>
		<slot />
  </body>
</html>
```

## Usage

Start it with `pnpm -F nuxt dev` and browse to [http://localhost:4321](http://localhost:4321)
