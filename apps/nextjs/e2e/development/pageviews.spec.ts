import { test, expect } from '@playwright/test';

test.describe('pageviews', () => {
  test('should track page views when navigating between pages', async ({
    page,
  }) => {
    const messages: string[] = [];

    page.on('console', (msg) => {
      const message = msg.text();

      if (message.includes('[Vercel Analytics]')) {
        messages.push(message);
      }
    });

    await page.goto('/');
    await page.waitForTimeout(200);

    await page.click('text=Public');

    await expect(page).toHaveURL('/public');
    await expect(page.locator('h1')).toContainText('Public');

    await page.waitForTimeout(200);

    expect(messages).toHaveLength(3);
  });
});
