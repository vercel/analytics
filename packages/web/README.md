![Analytics](https://github.com/vercel/analytics/blob/main/.github/banner.png)

<div align="center"><strong>Vercel Analytics for Audiences</strong></div>
<div align="center">Privacy-friendly, real-time traffic insights</div>
<br />
<div align="center">
<a href="https://vercel.com/analytics">Website</a>
<span> · </span>
<a href="https://vercel.com/docs/concepts/analytics/audiences/quickstart">Documentation</a>
<span> · </span>
<a href="https://twitter.com/vercel">Twitter</a>
</div>

## Overview

`@vercel/analytics` allows you to track page views in your Next.js app or any other website that is deployed to Vercel.

All page views are automatically tracked in your app.

This package does **not** track data in development mode.

## Quickstart

1. Enable Vercel Analytics for a project in the [Vercel Dashboard](https://vercel.com/dashboard).
2. Add the `@vercel/analytics` package to your project
3. Inject the Analytics script to your app

   - If you are using **Next.js** or **React**, you can use the `<Analytics />` component to inject the script into your app.
   - For other frameworks, you can use the `inject` function add the tracking script to your app.
   - If you want to use Vercel Analytics on a static site without npm, follow the instructions in the [documentation](https://vercel.com/docs/concepts/analytics/audiences/quickstart).

4. Deploy your app to Vercel and see data flowing in.

## Documentation

Find more details about this package in our [documentation](https://vercel.com/docs/concepts/analytics/audiences/quickstart).
