import { test, expect } from '@playwright/test';
import { useMockForProductionScript } from '../utils';

test.describe('pageview', () => {
  test('should track page views when navigating between pages', async ({
    page,
  }) => {
    const messages: string[] = [];
    await useMockForProductionScript({
      page,
      onPageView: () => {},
      debug: true,
    });

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
    await page.waitForTimeout(800);

    await page.click('text=Next');

    await expect(page).toHaveURL('/navigation/second');
    await expect(page.locator('h1')).toContainText('Second Page');

    await page.waitForTimeout(200);

    expect(
      messages.find((m) =>
        m.includes('[pageview] http://localhost:3000/navigation/first')
      )
    ).toBeDefined();
    expect(
      messages.find((m) =>
        m.includes('[pageview] http://localhost:3000/navigation/second')
      )
    ).toBeDefined();
  });
});
