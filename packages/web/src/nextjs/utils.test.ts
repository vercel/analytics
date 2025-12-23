import { afterEach, describe, expect, it } from 'vitest';
import { getBasePath, getConfigString } from './utils';

const processSave = { ...process };
const envSave = { ...process.env };

afterEach(() => {
  global.process = { ...processSave };
  process.env = { ...envSave };
});

describe('getBasePath()', () => {
  it('returns null without process', () => {
    // @ts-expect-error -- yes, we want to completely drop process for this test!!
    global.process = undefined;
    expect(getBasePath()).toBeUndefined();
  });

  it('returns null without process.env', () => {
    // @ts-expect-error -- yes, we want to completely drop process.env for this test!!
    process.env = undefined;
    expect(getBasePath()).toBeUndefined();
  });

  it('returns basepath set for Nextjs', () => {
    const basepath = `/_vercel-${Math.random()}/insights`;
    process.env.NEXT_PUBLIC_VERCEL_OBSERVABILITY_BASEPATH = basepath;
    expect(getBasePath()).toBe(basepath);
  });
});

describe('getConfigString()', () => {
  it('returns null without process', () => {
    // @ts-expect-error -- yes, we want to completely drop process for this test!!
    global.process = undefined;
    expect(getConfigString()).toBeUndefined();
  });

  it('returns null without process.env', () => {
    // @ts-expect-error -- yes, we want to completely drop process.env for this test!!
    process.env = undefined;
    expect(getConfigString()).toBeUndefined();
  });

  it('returns configuration string set for CRA', () => {
    const config = JSON.stringify({
      analytics: {
        eventEndpoint: `/_vercel-${Math.random()}`,
      },
    });
    process.env.NEXT_PUBLIC_VERCEL_OBSERVABILITY_CLIENT_CONFIG = config;
    expect(getConfigString()).toBe(config);
  });
});
