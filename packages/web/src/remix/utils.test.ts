import { afterEach, describe, expect, it } from 'vitest';
import { getBasePath, getConfigString } from './utils';

afterEach(() => {
  delete import.meta.env.VITE_VERCEL_OBSERVABILITY_BASEPATH;
  delete import.meta.env.VITE_VERCEL_OBSERVABILITY_CLIENT_CONFIG;
});

describe('getBasePath()', () => {
  it('returns basepath set for Remix', () => {
    const basepath = `/_vercel-${Math.random()}/insights`;
    import.meta.env.VITE_VERCEL_OBSERVABILITY_BASEPATH = basepath;
    expect(getBasePath()).toBe(basepath);
  });
});

describe('getConfigString()', () => {
  it('returns configuration string for Remix', () => {
    const config = JSON.stringify({
      analytics: {
        eventEndpoint: `/_vercel-${Math.random()}`,
      },
    });
    import.meta.env.VITE_VERCEL_OBSERVABILITY_CLIENT_CONFIG = config;
    expect(getConfigString()).toBe(config);
  });
});
