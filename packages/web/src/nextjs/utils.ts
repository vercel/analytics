'use client';
import {
  useParams,
  usePathname,
  useSearchParams,
  useSelectedLayoutSegments,
} from 'next/navigation.js';
import { computeRoute } from '../utils';

export const useRoute = (): {
  route: string | null;
  path: string;
} => {
  const params = useParams();
  const searchParams = useSearchParams();
  const path = usePathname();
  // null in Pages Router, string[] in App Router
  const segments = useSelectedLayoutSegments();

  // Until we have route parameters, we don't compute the route
  if (!params) {
    return { route: null, path };
  }

  // in Next.js@13, useParams() could return an empty object for pages router, and we default to searchParams.
  const paramObject = Object.keys(params).length
    ? params
    : Object.fromEntries(searchParams.entries());

  const finalParams =
    segments !== null
      ? filterParallelRouteParams(paramObject, segments)
      : paramObject;

  return { route: computeRoute(path, finalParams), path };
};

/**
 * Filters out array params from parallel route slots.
 *
 * In Next.js App Router, `useParams()` merges params from all active route
 * segments including parallel slots (`@folder` convention). Slot params
 * don't correspond to the URL structure and corrupt route computation.
 *
 * Next.js stores multi-segment catch-all values joined with '/' in the router
 * tree (e.g., `[...slug]` matching `['api', 'ref']` → stored as `'api/ref'`),
 * so `useSelectedLayoutSegments('children')` returns slash-containing strings
 * only for genuine main-route catch-alls.
 *
 * Array params are kept only when their joined value contains '/' and appears
 * as a segment in the children path. Single-segment catch-alls are treated as
 * static paths — an acceptable trade-off vs. slot contamination.
 */
export function filterParallelRouteParams(
  params: Record<string, string | string[]>,
  segments: string[],
): Record<string, string | string[]> {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      if (!Array.isArray(value)) return true;
      const joined = value.join('/');
      return joined.includes('/') && segments.includes(joined);
    }),
  );
}

// !! important !!
// do not access env variables using process.env[varname]
// some bundlers won't replace the value at build time.

export function getBasePath(): string | undefined {
  if (typeof process === 'undefined' || typeof process.env === 'undefined') {
    return undefined;
  }
  return process.env.NEXT_PUBLIC_VERCEL_OBSERVABILITY_BASEPATH;
}

export function getConfigString(): string | undefined {
  if (typeof process === 'undefined' || typeof process.env === 'undefined') {
    return undefined;
  }
  return process.env.NEXT_PUBLIC_VERCEL_OBSERVABILITY_CLIENT_CONFIG;
}
