'use client';
/* eslint-disable @typescript-eslint/no-unnecessary-condition -- can be empty in pages router */
import { useParams, usePathname, useSearchParams } from 'next/navigation.js';
import { computeRoute } from '../utils';

export const useRoute = (): {
  route: string | null;
  path: string;
} => {
  const params = useParams();
  const searchParams = useSearchParams();
  const path = usePathname();

  // Until we have route parameters, we don't compute the route
  if (!params) {
    return { route: null, path };
  }
  // in Next.js@13, useParams() could return an empty object for pages router, and we default to searchParams.
  const finalParams = Object.keys(params).length
    ? params
    : Object.fromEntries(searchParams.entries());
  return { route: computeRoute(path, finalParams), path };
};

export function getBasePath(): string | undefined {
  // !! important !!
  // do not access env variables using process.env[varname]
  // some bundles won't replace the value at build time.
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain -- we can't use optionnal here, it'll break if process does not exist.
  if (typeof process === 'undefined' || typeof process.env === 'undefined') {
    return undefined;
  }
  return process.env.NEXT_PUBLIC_VERCEL_OBSERVABILITY_BASEPATH;
}
