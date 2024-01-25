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
          sdkn: '@vercel/analytics/next',
          sdkv: expect.any(String),
          dp: '/navigation/first',
        },
      },
      {
        page: 'http://localhost:3000/navigation/second',
        payload: {
          o: 'http://localhost:3000/navigation/second',
          ts: expect.any(Number),
          sv: expect.any(String),
          sdkn: '@vercel/analytics/next',
          sdkv: expect.any(String),
          dp: '/navigation/second',
        },
      },
    ]);
  });

  test('should properly send dynamic route', async ({ page }) => {
    const payloads: { page: string; payload: Object }[] = [];

    await useMockForProductionScript({
      page,
      onPageView: (page, payload) => {
        payloads.push({ page, payload });
      },
    });

    await page.goto('/blog');
    await page.waitForLoadState('networkidle');

    await page.click('text=My first blog post');

    await expect(page).toHaveURL('/blog/my-first-blogpost');
    await expect(page.locator('h2')).toContainText('my-first-blogpost');

    await page.waitForLoadState('networkidle');

    await page.click('text=Back to blog');

    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/blog');

    await page.click('text=Feature just got released');

    await expect(page.locator('h2')).toContainText('new-feature-release');

    expect(payloads).toEqual([
      {
        page: 'http://localhost:3000/blog',
        payload: {
          dp: '/blog',
          o: 'http://localhost:3000/blog',
          r: '',
          sdkn: '@vercel/analytics/next',
          sdkv: expect.any(String),
          sv: expect.any(String),
          ts: expect.any(Number),
        },
      },
      {
        page: 'http://localhost:3000/blog/my-first-blogpost',
        payload: {
          dp: '/blog/[slug]',
          o: 'http://localhost:3000/blog/my-first-blogpost',
          sdkn: '@vercel/analytics/next',
          sdkv: expect.any(String),
          sv: expect.any(String),
          ts: expect.any(Number),
        },
      },
      {
        page: 'http://localhost:3000/blog',
        payload: {
          dp: '/blog',
          o: 'http://localhost:3000/blog',
          sdkn: '@vercel/analytics/next',
          sdkv: expect.any(String),
          sv: expect.any(String),
          ts: expect.any(Number),
        },
      },
      {
        page: 'http://localhost:3000/blog/new-feature-release',
        payload: {
          dp: '/blog/[slug]',
          o: 'http://localhost:3000/blog/new-feature-release',
          sdkn: '@vercel/analytics/next',
          sdkv: expect.any(String),
          sv: expect.any(String),
          ts: expect.any(Number),
        },
      },
    ]);
  });

  test('should send pageviews when route doesnt change but path does', async ({
    page,
  }) => {
    const payloads: { page: string; payload: Object }[] = [];

    await useMockForProductionScript({
      page,
      onPageView: (page, payload) => {
        payloads.push({ page, payload });
      },
    });

    await page.goto('/blog/my-first-blogpost');
    await page.waitForLoadState('networkidle');

    await page.click('text=Feature just got released');

    await expect(page.locator('h2')).toContainText('new-feature-release');

    expect(payloads).toEqual([
      {
        page: 'http://localhost:3000/blog/my-first-blogpost',
        payload: {
          dp: '/blog/[slug]',
          o: 'http://localhost:3000/blog/my-first-blogpost',
          sdkn: '@vercel/analytics/next',
          sdkv: expect.any(String),
          sv: expect.any(String),
          ts: expect.any(Number),
          r: '',
        },
      },
      {
        page: 'http://localhost:3000/blog/new-feature-release',
        payload: {
          dp: '/blog/[slug]',
          o: 'http://localhost:3000/blog/new-feature-release',
          sdkn: '@vercel/analytics/next',
          sdkv: expect.any(String),
          sv: expect.any(String),
          ts: expect.any(Number),
        },
      },
    ]);
  });
});
