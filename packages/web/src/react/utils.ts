// !! important !!
// do not access env variables using process.env[varname]
// some bundlers won't replace the value at build time.

export function getBasePath(): string | undefined {
  if (typeof process === 'undefined' || typeof process.env === 'undefined') {
    return undefined;
  }
  return process.env.REACT_APP_VERCEL_OBSERVABILITY_BASEPATH;
}

export function getConfigString(): string | undefined {
  if (typeof process === 'undefined' || typeof process.env === 'undefined') {
    return undefined;
  }
  return process.env.REACT_APP_VERCEL_OBSERVABILITY_CLIENT_CONFIG;
}
