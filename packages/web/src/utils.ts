export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function isDevelopment(): boolean {
  return (
    typeof process !== 'undefined' && process.env.NODE_ENV !== 'production'
  );
}
