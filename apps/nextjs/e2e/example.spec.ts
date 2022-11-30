import { test, expect } from '@playwright/test';

test('should navigate to the about page', async ({ page }) => {
  const payloads: { page: string; payload: Object }[] = [];

  page.on('console', (msg) => {
    console.log(msg.text());
  });

  await page.route('**/_vercel/insights/script.js', async (route, request) => {
    console.log('script.js intercepted');
    return route.fulfill({
      status: 301,
      headers: { location: 'https://cdn.vercel-insights.com/v1/script.js' },
    });
  });

  await page.route('**/_vercel/insights/view', async (route, request) => {
    const headers = request.headers();

    payloads.push({
      page: headers.referer,
      payload: request.postDataJSON(),
    });

    return route.fulfill({
      status: 200,
      contentType: 'text/plain',
      body: 'OK',
    });
  });

  await page.goto('/', { waitUntil: 'networkidle' });

  await page.waitForTimeout(1000);

  await page.click('text=Public');
  await page.waitForLoadState('networkidle');

  await page.waitForTimeout(1000);

  await expect(page).toHaveURL('/public');
  await expect(page.locator('h1')).toContainText('Public');

  await page.waitForTimeout(1000);

  expect(payloads).toMatchObject([
    {
      page: 'http://localhost:3000/',
      payload: { o: 'http://localhost:3000/', ts: expect.any(Number), r: '' },
    },
    {
      page: 'http://localhost:3000/public',
      payload: {
        o: 'http://localhost:3000/public',
        ts: expect.any(Number),
      },
    },
  ]);
});
