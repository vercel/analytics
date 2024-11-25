import { afterEach, describe, it, expect } from 'vitest';
import { getBasePath } from './utils';

describe('getBasePath()', () => {
  const processSave = { ...process };
  const envSave = { ...process.env };

  afterEach(() => {
    global.process = { ...processSave };
    process.env = { ...envSave };
  });

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

  it('returns basepath set for CRA', () => {
    const basepath = `/_vercel-${Math.random()}/insights`;
    process.env.REACT_APP_VERCEL_OBSERVABILITY_BASEPATH = basepath;
    expect(getBasePath()).toBe(basepath);
  });
});
