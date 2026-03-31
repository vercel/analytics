import { useLocation, useParams } from '@remix-run/react';
import { computeRoute } from '../utils';

export const useRoute = (): { route: string | null; path: string } => {
  const params = useParams();
  const { pathname: path } = useLocation();
  return { route: computeRoute(path, params as never), path };
};

// !! important !!
// do not access env variables using import.meta.env[varname]
// some bundlers won't replace the value at build time.

export function getBasePath(): string | undefined {
  try {
    return import.meta.env.VITE_VERCEL_OBSERVABILITY_BASEPATH as
      | string
      | undefined;
  } catch {
    // do nothing
  }
}

export function getConfigString(): string | undefined {
  try {
    return import.meta.env.VITE_VERCEL_OBSERVABILITY_CLIENT_CONFIG as
      | string
      | undefined;
  } catch {
    // do nothing
  }
}
