import { test, expect } from '@playwright/test';
import { useMockForProductionScript } from '../utils';

test.describe('beforeSend', () => {
  test('should replace the value of the secret query parameter', async ({
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

    await page.goto('/before-send/first');
    await page.waitForLoadState('networkidle');

    await page.click('text=Next');

    await expect(page).toHaveURL('/before-send/second?secret=vercel');
    await expect(page.locator('h1')).toContainText('Second Page');

    await page.waitForLoadState('networkidle');

    expect(
      messages.find((m) =>
        m.includes('[pageview] http://localhost:3000/before-send/first')
      )
    ).toBeDefined();
    expect(
      messages.find((m) =>
        m.includes(
          '[pageview] http://localhost:3000/before-send/second?secret=REDACTED'
        )
      )
    ).toBeDefined();

    expect(messages.find((m) => m.includes('secret=vercel'))).toBeUndefined();
  });
});
