import { test, expect } from '@playwright/test';
import { useMockForProductionScript } from '../utils';

test.describe('beforeSend', () => {
  test('should replace the value of the secret query parameter when navigating to /private', async ({
    page,
  }) => {
    const payloads: { page: string; payload: Object }[] = [];

    await useMockForProductionScript({
      page,
      onPageView: (page, payload) => {
        payloads.push({ page, payload });
      },
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.click('text=Private');

    await expect(page).toHaveURL('/private?secret=vercel');
    await expect(page.locator('h1')).toContainText('Private');

    await page.waitForLoadState('networkidle');

    expect(payloads).toMatchObject([
      {
        page: 'http://localhost:3000/',
        payload: { o: 'http://localhost:3000/', ts: expect.any(Number), r: '' },
      },
      {
        page: 'http://localhost:3000/private?secret=vercel',
        payload: {
          o: 'http://localhost:3000/private?secret=REDACTED',
          ts: expect.any(Number),
        },
      },
    ]);
  });
});
