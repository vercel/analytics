import type { AllowedPropertyValues, Mode } from './types';

export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function detectEnvironment(): 'development' | 'production' {
  if (typeof process === 'undefined') return 'production';

  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test')
    return 'development';

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
  return window.vam || 'production';
}

export function isProduction(): boolean {
  return getMode() === 'production';
}

export function isDevelopment(): boolean {
  return getMode() === 'development';
}

const removeKey = (key: string, { [key]: _, ...rest }): Record<string, any> =>
  rest;

export function parseProperties(
  properties: Record<string, unknown>,
  options: {
    strip?: boolean;
  },
): Error | Record<string, AllowedPropertyValues> | undefined {
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
