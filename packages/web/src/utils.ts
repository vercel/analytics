export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function isDevelopment(): boolean {
  if (typeof process === 'undefined') return false;
  return (
    process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
  );
}
