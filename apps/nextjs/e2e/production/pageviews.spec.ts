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

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.click('text=Public');

    await expect(page).toHaveURL('/public');
    await expect(page.locator('h1')).toContainText('Public');

    await page.waitForLoadState('networkidle');

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
});
