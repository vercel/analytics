import type { Mode } from './types';

export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function isDevelopment(): boolean {
  try {
    return (
      process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
    );
  } catch (e) {
    return false;
  }
}

export function getMode(mode: Mode = 'auto'): Mode {
  if (mode === 'auto') {
    return isDevelopment() ? 'development' : 'production';
  }

  return mode;
}
