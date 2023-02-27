import { test, expect } from '@playwright/test';
import { useMockForProductionScript } from '../utils';

test.describe('pageview', () => {
  test('should track page views when navigating between pages', async ({
    page,
  }) => {
    const payloads: { page: string; payload: Object }[] = [];

    await useMockForProductionScript({
      page,
      onPageView: (page, payload) => {
        payloads.push({ page, payload });
      },
    });

    await page.goto('/navigation/first');
    await page.waitForLoadState('networkidle');

    await page.click('text=Next');

    await expect(page).toHaveURL('/navigation/second');
    await expect(page.locator('h1')).toContainText('Second Page');

    await page.waitForLoadState('networkidle');

    expect(payloads).toEqual([
      {
        page: 'http://localhost:3000/navigation/first',
        payload: {
          o: 'http://localhost:3000/navigation/first',
          ts: expect.any(Number),
          r: '',
          sv: expect.any(String),
          sdkn: '@vercel/analytics',
          sdkv: expect.any(String),
        },
      },
      {
        page: 'http://localhost:3000/navigation/second',
        payload: {
          o: 'http://localhost:3000/navigation/second',
          ts: expect.any(Number),
          sv: expect.any(String),
          sdkn: '@vercel/analytics',
          sdkv: expect.any(String),
        },
      },
    ]);
  });
});
