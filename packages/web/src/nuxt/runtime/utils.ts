// !! important !!
// do not access env variables using import.meta.env[varname]
// some bundlers won't replace the value at build time.

export function getBasePath(): string | undefined {
  try {
    return import.meta.env.VITE_VERCEL_OBSERVABILITY_BASEPATH as
      | string
      | undefined;
  } catch {
    // do nothing
  }
}

export function getConfigString(): string | undefined {
  try {
    return import.meta.env.VITE_VERCEL_OBSERVABILITY_CLIENT_CONFIG as
      | string
      | undefined;
  } catch {
    // do nothing
  }
}
