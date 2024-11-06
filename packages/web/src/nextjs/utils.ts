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
