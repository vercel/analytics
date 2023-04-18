import { test, expect } from '@playwright/test';

test.describe('pageview', () => {
  test('should track page views when navigating between pages', async ({
    page,
  }) => {
    const messages: string[] = [];

    page.on('console', (msg) => {
      const message = msg.text();

      if (
        message.includes('[Vercel Web Analytics]') ||
        message.includes('[Vercel Analytics]')
      ) {
        messages.push(message);
      }
    });

    await page.goto('/navigation/first');
    await page.waitForTimeout(200);

    await page.click('text=Next');

    await expect(page).toHaveURL('/navigation/second');
    await expect(page.locator('h1')).toContainText('Second Page');

    await page.waitForTimeout(200);

    expect(messages).toHaveLength(3);
  });
});
