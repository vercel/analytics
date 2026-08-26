import { beforeEach, describe, expect, it, vi } from 'vitest';
import { track, trackExposure } from './index';

const exposure = {
  experimentId: 'checkout-redesign',
  variantId: 'treatment',
  unitKey: 'user' as const,
  unitValue: 'user_123',
};

describe('server track in browser environment', () => {
  global.fetch = vi.fn();
  const fetchMock = vi.mocked(global.fetch);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws error in development mode', async () => {
    (global as { window?: { vam?: string } }).window = { vam: 'development' };

    await expect(track('test-event')).rejects.toThrow(
      /imported the `track` function from `@vercel\/analytics\/server` in a browser environment/,
    );
  });

  it('returns early in production mode', async () => {
    (global as { window?: object }).window = {};

    await track('test-event');

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('throws for trackExposure in development mode', async () => {
    (global as { window?: { vam?: string } }).window = { vam: 'development' };

    await expect(trackExposure(exposure)).rejects.toThrow(
      /imported the `trackExposure` function from `@vercel\/analytics\/server` in a browser environment/,
    );
  });

  it('returns early for trackExposure in production mode', async () => {
    (global as { window?: object }).window = {};

    await trackExposure(exposure);

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
