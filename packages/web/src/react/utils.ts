export function getBasePath(): string | undefined {
  // !! important !!
  // do not access env variables using process.env[varname]
  // some bundles won't replace the value at build time.
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain -- we can't use optionnal here, it'll break if process does not exist.
  if (typeof process === 'undefined' || typeof process.env === 'undefined') {
    return undefined;
  }
  return process.env.REACT_APP_VERCEL_OBSERVABILITY_BASEPATH;
}
