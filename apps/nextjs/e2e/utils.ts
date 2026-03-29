import type { Page } from '@playwright/test';

export async function useMockForProductionScript(props: {
  page: Page;
  onPageView: (page: string, payload: unknown) => void;
  debug?: boolean;
}) {
  await props.page.addInitScript({
    content:
      "Object.defineProperty(navigator, 'webdriver', { get() { return undefined }})",
  });

  await props.page.route('**/_vercel/insights/script.js', async (route) => {
    const response = await route.fetch({
      url: props.debug
        ? 'https://va.vercel-scripts.com/v1/script.debug.js'
        : 'https://va.vercel-scripts.com/v1/script.js',
    });
    return route.fulfill({ response });
  });

  await props.page.route('**/_vercel/insights/view', async (route, request) => {
    const headers = request.headers();

    props.onPageView(headers.referer, request.postDataJSON());

    return route.fulfill({
      status: 200,
      contentType: 'text/plain',
      body: 'OK',
    });
  });
}
