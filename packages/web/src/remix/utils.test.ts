import { afterEach, describe, it, expect } from 'vitest';
import { getBasePath } from './utils';

describe('getBasePath()', () => {
  const processSave = { ...process };
  const envSave = { ...process.env };

  afterEach(() => {
    global.process = { ...processSave };
    process.env = { ...envSave };
  });

  it('returns basepath set for Remix', () => {
    const basepath = `/_vercel-${Math.random()}/insights`;
    import.meta.env.VITE_VERCEL_OBSERVABILITY_BASEPATH = basepath;
    expect(getBasePath()).toBe(basepath);
  });

  it('returns null without import.meta', () => {
    // @ts-expect-error -- yes, we want to completely drop import.meta.env for this test!!
    import.meta.env = undefined;
    expect(getBasePath()).toBeUndefined();
  });
});
