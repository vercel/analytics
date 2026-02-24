import { afterEach, describe, expect, it } from 'vitest';
import {
  filterParallelRouteParams,
  getBasePath,
  getConfigString,
} from './utils';

const processSave = { ...process };
const envSave = { ...process.env };

afterEach(() => {
  global.process = { ...processSave };
  process.env = { ...envSave };
});

describe('parallel route slot param filtering', () => {
  it('filters single-segment slot catch-all from static main route', () => {
    const params = { catchAll: ['dashboard'] };
    const segments = ['parallel-routes', 'dashboard'];
    expect(filterParallelRouteParams(params, segments)).toEqual({});
  });

  it('keeps multi-segment catch-all from main route', () => {
    const params = { slug: ['api', 'reference'] };
    // Next.js joins catch-all values with '/' in the router tree
    const segments = ['docs', 'api/reference'];
    expect(filterParallelRouteParams(params, segments)).toEqual({
      slug: ['api', 'reference'],
    });
  });

  it('keeps string params and filters slot array params', () => {
    const params = { id: '123', catchAll: ['123', 'detail', 'test'] };
    const segments = ['parallel-routes', '123', 'detail', 'test'];
    expect(filterParallelRouteParams(params, segments)).toEqual({ id: '123' });
  });

  it('filters multi-segment slot catch-all whose joined value is not a single segment in children', () => {
    // The slot joins to '123/detail/test' but children has them as separate segments
    const params = { id: '123', catchAll: ['123', 'detail', 'test'] };
    const segments = ['parallel-routes', '123', 'detail', 'test'];
    expect(filterParallelRouteParams(params, segments)).toEqual({ id: '123' });
  });

  it('keeps all params when segments is empty (graceful fallback)', () => {
    const params = { id: '123' };
    expect(filterParallelRouteParams(params, [])).toEqual({ id: '123' });
  });
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
        viewEndpoint: `/_vercel-${Math.random()}`,
        eventEndpoint: `/hfi/${Math.random()}`,
        sessionEndpoint: `/_sessions-${Math.random()}`,
      },
    });
    process.env.NEXT_PUBLIC_VERCEL_OBSERVABILITY_CLIENT_CONFIG = config;
    expect(getConfigString()).toBe(config);
  });
});
