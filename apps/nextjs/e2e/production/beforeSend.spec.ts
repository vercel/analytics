import { test, expect } from '@playwright/test';
import { useMockForProductionScript } from '../utils';

test.describe('beforeSend', () => {
  test('should replace the value of the secret query parameter', async ({
    page,
  }) => {
    const payloads: { page: string; payload: Object }[] = [];

    await useMockForProductionScript({
      page,
      onPageView: (page, payload) => {
        payloads.push({ page, payload });
      },
    });

    await page.goto('/before-send/first');
    await page.waitForLoadState('networkidle');

    await page.click('text=Next');

    await expect(page).toHaveURL('/before-send/second?secret=vercel');
    await expect(page.locator('h1')).toContainText('Second Page');

    await page.waitForLoadState('networkidle');

    expect(payloads).toMatchObject([
      {
        page: 'http://localhost:3000/before-send/first',
        payload: {
          o: 'http://localhost:3000/before-send/first',
          sv: expect.any(String),
          sdkn: '@vercel/analytics',
          sdkv: expect.any(String),
          ts: expect.any(Number),
          r: '',
        },
      },
      {
        page: 'http://localhost:3000/before-send/second?secret=vercel',
        payload: {
          o: 'http://localhost:3000/before-send/second?secret=REDACTED',
          ts: expect.any(Number),
          sv: expect.any(String),
          sdkn: '@vercel/analytics',
          sdkv: expect.any(String),
        },
      },
    ]);
  });
});
