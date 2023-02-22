import { Page } from '@playwright/test';

export async function useMockForProductionScript(props: {
  page: Page;
  onPageView: (page: string, payload: Object) => void;
}) {
  await props.page.route('**/_vercel/insights/script.js', async (route, _) => {
    return route.fulfill({
      status: 301,
      headers: { location: 'https://cdn.vercel-insights.com/v1/script.js' },
    });
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
