import { test, expect } from '@playwright/test';
import { useMockForProductionScript } from '../utils';

test.describe('pageviews', () => {
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

    await expect(page).toHaveURL('/navigation/first');
    await expect(page.locator('h1')).toContainText('First Page');

    await page.waitForLoadState('networkidle');

    expect(payloads).toMatchObject([
      {
        page: 'http://localhost:3000/navigation/first',
        payload: {
          o: 'http://localhost:3000/navigation/first',
          ts: expect.any(Number),
          r: '',
        },
      },
      {
        page: 'http://localhost:3000/navigation/second',
        payload: {
          o: 'http://localhost:3000/navigation/second',
          ts: expect.any(Number),
        },
      },
    ]);
  });
});
