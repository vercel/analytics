import { useLocation, useParams } from '@remix-run/react';
import { computeRoute } from '../utils';

export const useRoute = (): { route: string | null; path: string } => {
  const params = useParams();
  const { pathname: path } = useLocation();
  return { route: computeRoute(path, params as never), path };
};
