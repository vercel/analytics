import type { InternalOptions } from './types';

/**
 * `__cdp` is not part of the public signatures. Like Vercel's CDP, tests
 * widen the options with the runtime-only contract through one assertion.
 */
export function withCdp<T extends object>(
  options: Partial<T> & InternalOptions,
): T {
  return options as T;
}
