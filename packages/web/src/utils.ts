import type { AllowedPropertyValues, AnalyticsProps, Mode } from './types';

export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function detectEnvironment(): 'development' | 'production' {
  try {
    const env = process.env.NODE_ENV;
    if (env === 'development' || env === 'test') {
      return 'development';
    }
  } catch (e) {
    // do nothing, this is okay
  }
  return 'production';
}

export function setMode(mode: Mode = 'auto'): void {
  if (mode === 'auto') {
    window.vam = detectEnvironment();
    return;
  }

  window.vam = mode;
}

export function getMode(): Mode {
  const mode = isBrowser() ? window.vam : detectEnvironment();
  return mode || 'production';
}

export function isProduction(): boolean {
  return getMode() === 'production';
}

export function isDevelopment(): boolean {
  return getMode() === 'development';
}

function removeKey(
  key: string,
  { [key]: _, ...rest }
): Record<string, unknown> {
  return rest;
}

export function parseProperties(
  properties: Record<string, unknown> | undefined,
  options: {
    strip?: boolean;
  }
): Error | Record<string, AllowedPropertyValues> | undefined {
  if (!properties) return undefined;
  let props = properties;
  const errorProperties: string[] = [];
  for (const [key, value] of Object.entries(properties)) {
    if (typeof value === 'object' && value !== null) {
      if (options.strip) {
        props = removeKey(key, props);
      } else {
        errorProperties.push(key);
      }
    }
  }

  if (errorProperties.length > 0 && !options.strip) {
    throw Error(
      `The following properties are not valid: ${errorProperties.join(
        ', '
      )}. Only strings, numbers, booleans, and null are allowed.`
    );
  }
  return props as Record<string, AllowedPropertyValues>;
}

export function computeRoute(
  pathname: string | null,
  pathParams: Record<string, string | string[]> | null
): string | null {
  if (!pathname || !pathParams) {
    return pathname;
  }

  let result = pathname;
  try {
    const entries = Object.entries(pathParams);
    // simple keys must be handled first
    for (const [key, value] of entries) {
      if (!Array.isArray(value)) {
        const matcher = turnValueToRegExp(value);
        if (matcher.test(result)) {
          result = result.replace(matcher, `/[${key}]`);
        }
      }
    }
    // array values next
    for (const [key, value] of entries) {
      if (Array.isArray(value)) {
        const matcher = turnValueToRegExp(value.join('/'));
        if (matcher.test(result)) {
          result = result.replace(matcher, `/[...${key}]`);
        }
      }
    }
    return result;
  } catch (e) {
    return pathname;
  }
}

function turnValueToRegExp(value: string): RegExp {
  return new RegExp(`/${escapeRegExp(value)}(?=[/?#]|$)`);
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function getBasePath(): null | string {
  // !! important !!
  // do not access env variables using process.env[varname] or import.meta.env[varname].
  // some bundles won't replace the value at build time.

  // vite-powered apps (sveltekit, nuxt, vue, astro, remix)
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error -- only TS during build time will complain.
    // @ts-ignore -- Rollup will fail to generate d.ts because it doesn't know import.meta.env.
    const viteValue = import.meta.env
      .VITE_VERCEL_OBSERVABILITY_BASEPATH as string;
    if (viteValue) {
      return viteValue;
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error -- only TS during build time will complain.
    // @ts-ignore -- Rollup will fail to generate d.ts because it doesn't know import.meta.env.
    const astroValue = import.meta.env
      .PUBLIC_VERCEL_OBSERVABILITY_BASEPATH as string;
    if (astroValue) {
      return astroValue;
    }
  } catch {
    // do nothing
  }
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain -- we can't use optionnal here, it'll break if process does not exist.
  if (typeof process === 'undefined' || typeof process.env === 'undefined') {
    return null;
  }
  // nextjs apps
  const nextValue = process.env.NEXT_PUBLIC_VERCEL_OBSERVABILITY_BASEPATH;
  if (nextValue) {
    return nextValue;
  }
  // create-react-app
  const craValue = process.env.REACT_APP_VERCEL_OBSERVABILITY_BASEPATH;
  if (craValue) {
    return craValue;
  }
  return null;
}

export function getScriptSrc(props: AnalyticsProps): string {
  if (props.scriptSrc) {
    return props.scriptSrc;
  }
  if (isDevelopment()) {
    return 'https://va.vercel-scripts.com/v1/script.debug.js';
  }
  const basePath = getBasePath();
  if (basePath) {
    return `${basePath}/insights/script.js`;
  }
  return '/_vercel/insights/script.js';
}
