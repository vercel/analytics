import { name as packageName, version } from '../package.json';
import type {
  AllowedPropertyValues,
  AnalyticsProps,
  BeforeSend,
  InjectProps,
  Mode,
} from './types';

export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function detectEnvironment(): 'development' | 'production' {
  try {
    const env = process.env.NODE_ENV;
    if (env === 'development' || env === 'test') {
      return 'development';
    }
  } catch {
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
  { [key]: _, ...rest },
): Record<string, unknown> {
  return rest;
}

export function parseProperties(
  properties: Record<string, unknown> | undefined,
  options: {
    strip?: boolean;
  },
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
        ', ',
      )}. Only strings, numbers, booleans, and null are allowed.`,
    );
  }
  return props as Record<string, AllowedPropertyValues>;
}

export function computeRoute(
  pathname: string | null,
  pathParams: Record<string, string | string[]> | null,
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
  } catch {
    return pathname;
  }
}

function turnValueToRegExp(value: string): RegExp {
  return new RegExp(`/${escapeRegExp(value)}(?=[/?#]|$)`);
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getScriptSrc(props: AnalyticsProps & { basePath?: string }): string {
  if (props.scriptSrc) {
    return makeAbsolute(props.scriptSrc);
  }
  if (isDevelopment()) {
    return 'https://va.vercel-scripts.com/v1/script.debug.js';
  }
  if (props.basePath) {
    return makeAbsolute(`${props.basePath}/insights/script.js`);
  }
  return '/_vercel/insights/script.js';
}

export function loadProps(
  explicitProps: InjectProps,
  confString?: string,
): {
  src: string;
  beforeSend?: BeforeSend;
  dataset: Record<string, string>;
} {
  let props = explicitProps;
  if (confString) {
    try {
      props = {
        ...(JSON.parse(confString)?.analytics as InjectProps),
        ...explicitProps,
      };
    } catch {
      // do nothing
    }
  }
  setMode(props.mode);

  const dataset: Record<string, string> = {
    sdkn: packageName + (props.framework ? `/${props.framework}` : ''),
    sdkv: version,
  };
  if (props.disableAutoTrack) {
    dataset.disableAutoTrack = '1';
  }
  if (props.viewEndpoint) {
    dataset.viewEndpoint = makeAbsolute(props.viewEndpoint);
  }
  if (props.eventEndpoint) {
    dataset.eventEndpoint = makeAbsolute(props.eventEndpoint);
  }
  if (props.sessionEndpoint) {
    dataset.sessionEndpoint = makeAbsolute(props.sessionEndpoint);
  }
  if (isDevelopment() && props.debug === false) {
    dataset.debug = 'false';
  }
  if (props.dsn) {
    dataset.dsn = props.dsn;
  }
  // deprecated
  if (props.endpoint) {
    dataset.endpoint = props.endpoint;
  } else if (props.basePath) {
    dataset.endpoint = makeAbsolute(`${props.basePath}/insights`);
  }

  return {
    beforeSend: props.beforeSend,
    src: getScriptSrc(props),
    dataset,
  };
}

function makeAbsolute(url: string): string {
  return url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('/')
    ? url
    : `/${url}`;
}
