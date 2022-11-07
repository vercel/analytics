export function isBrowser() {
  return typeof window !== 'undefined';
}

export function isProduction() {
  return (
    typeof process !== 'undefined' && process.env.NODE_ENV === 'production'
  );
}
