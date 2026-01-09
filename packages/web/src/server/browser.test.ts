import { beforeEach, describe, expect, it, vi } from 'vitest';
import { track } from './index';

describe('server track in browser environment', () => {
  global.fetch = vi.fn();
  const fetchMock = vi.mocked(global.fetch);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws error in development mode', async () => {
    (global as { window?: { vam?: string } }).window = { vam: 'development' };

    await expect(track('test-event')).rejects.toThrow(
      /imported the `track` function from `@vercel\/web-analytics\/server` in a browser environment/,
    );
  });

  it('returns early in production mode', async () => {
    (global as { window?: object }).window = {};

    await track('test-event');

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
