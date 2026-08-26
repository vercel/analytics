import { name as packageName, version } from '../../package.json';
import type { FlagsDataInput, PlainFlags } from '../types';
import { isProduction } from '../utils';

/**
 * Everything the server-side senders (`track`, `trackExposure`, ...) share:
 * runtime guards, endpoint resolution, header forwarding, and firing the
 * request without leaking the connection. A sender should only have to
 * describe *what* it sends.
 */

export type HeadersObject = Record<string, string | string[] | undefined>;
export type AllowedHeaders = Headers | HeadersObject;

export interface Options {
  flags?: FlagsDataInput;
  headers?: AllowedHeaders;
  request?: { headers: AllowedHeaders };
}

export interface RequestContext {
  get: () => {
    headers: Record<string, string | undefined>;
    url: string;
    waitUntil?: (promise: Promise<unknown>) => void;
    flags?: {
      getValues: () => PlainFlags;
      reportValue: (key: string, value: unknown) => void;
    };
  };
}

export type ResolvedRequestContext =
  | ReturnType<RequestContext['get']>
  | undefined;

const symbol = Symbol.for('@vercel/request-context');
const logPrefix = '[Vercel Web Analytics]';

/** Name of a public sender, quoted back to the user in messages. */
export type SenderName = 'track' | 'trackExposure';

function isHeaders(headers?: AllowedHeaders): headers is Headers {
  if (!headers) return false;
  return typeof (headers as HeadersObject).entries === 'function';
}

/**
 * The server senders must never run in the browser. Throws in development so
 * the mistake is loud, and reports back in production so the caller can bail
 * out silently.
 *
 * @returns `true` when the caller must return early.
 */
export function rejectBrowserRuntime(fnName: SenderName): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  if (!isProduction()) {
    throw new Error(
      `${logPrefix} It seems like you imported the \`${fnName}\` function from \`@vercel/analytics/server\` in a browser environment. This function is only meant to be used in a server environment.`,
    );
  }

  return true;
}

/**
 * Explains why nothing was sent when no endpoint could be resolved: a real
 * misconfiguration in production, and the payload itself in development, where
 * printing it is the whole point.
 *
 * @param devMessage - What to print in development, already formatted.
 */
export function reportMissingEndpoint(devMessage: string): void {
  if (isProduction()) {
    console.log(`${logPrefix} Can't find VERCEL_URL in environment variables.`);
    return;
  }

  if (!process.env.VERCEL_WEB_ANALYTICS_DISABLE_LOGS) {
    console.log(`${logPrefix} ${devMessage}`);
  }
}

export function getRequestContext(): ResolvedRequestContext {
  return ((globalThis as never)[symbol] as RequestContext | undefined)?.get();
}

export interface ResolvedHeaders {
  /** Incoming request headers, flattened to a plain object. */
  requestHeaders: HeadersObject;
  /**
   * Whether headers were found at all. An empty `Headers` instance still
   * counts as found, so this is not `Object.keys(requestHeaders).length > 0`.
   */
  hasHeaders: boolean;
}

export function resolveHeaders(
  options: Omit<Options, 'flags'> | undefined,
  requestContext: ResolvedRequestContext,
): ResolvedHeaders {
  let headers: AllowedHeaders | undefined;

  if (options && 'headers' in options) {
    headers = options.headers;
  } else if (options?.request) {
    headers = options.request.headers;
  } else if (requestContext?.headers) {
    // not explicitly passed in context, so take it from async storage
    headers = requestContext.headers;
  }

  let requestHeaders: HeadersObject = {};
  if (headers && isHeaders(headers)) {
    headers.forEach((value, key) => {
      requestHeaders[key] = value;
    });
  } else if (headers) {
    requestHeaders = headers;
  }

  return { requestHeaders, hasHeaders: Boolean(headers) };
}

/**
 * `VERCEL_WEB_ANALYTICS_ENDPOINT` is used verbatim for events.
 * For exposures it is treated as a base URL, unless
 * `VERCEL_WEB_ANALYTICS_EXPOSURE_ENDPOINT` overrides it.
 */
export function resolveEndpoint(
  kind: 'event' | 'exposure',
): string | undefined {
  if (
    kind === 'exposure' &&
    process.env.VERCEL_WEB_ANALYTICS_EXPOSURE_ENDPOINT
  ) {
    return process.env.VERCEL_WEB_ANALYTICS_EXPOSURE_ENDPOINT;
  }

  const base =
    process.env.VERCEL_WEB_ANALYTICS_ENDPOINT || process.env.VERCEL_URL;

  if (!base) {
    return undefined;
  }

  if (base.startsWith('http')) {
    return kind === 'event'
      ? base
      : new URL(`/_vercel/insights/${kind}`, base).toString();
  }

  return new URL(`/_vercel/insights/${kind}`, `https://${base}`).toString();
}

export interface DispatchOptions {
  /** Absolute URL of the ingestion endpoint. */
  endpoint: string;
  /** Public function name, quoted back to the user in messages. */
  fnName: SenderName;
  /** Caller options, the source of explicitly passed headers. */
  options: Omit<Options, 'flags'> | undefined;
  /**
   * The fields that make this event what it is, merged over the shared
   * envelope. Receives the request context so a sender can read flags from it.
   */
  payload: (requestContext: ResolvedRequestContext) => Record<string, unknown>;
}

/**
 * Wraps a payload in the envelope every event carries (origin, timestamp, SDK
 * name and version) and posts it, forwarding the session identity of the
 * incoming request. Never throws: a sender that fails must not take the
 * surrounding request down with it.
 */
export async function dispatch({
  endpoint,
  fnName,
  options,
  payload,
}: DispatchOptions): Promise<void> {
  try {
    const requestContext = getRequestContext();
    const { requestHeaders, hasHeaders } = resolveHeaders(
      options,
      requestContext,
    );

    if (!hasHeaders) {
      throw new Error(
        `No session context found. Pass \`request\` or \`headers\` to the \`${fnName}\` function.`,
      );
    }

    const body = {
      o:
        requestContext?.url ||
        (requestHeaders.referer as string) ||
        new URL(endpoint).origin,
      ts: Date.now(),
      sdkn: `${packageName}/server`,
      sdkv: version,
      r: '',
      ...payload(requestContext),
    };

    const BYPASS_SECRET = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

    const promise = fetch(endpoint, {
      headers: {
        'content-type': 'application/json',
        'user-agent': requestHeaders['user-agent'] as string,
        'x-vercel-ip': requestHeaders['x-forwarded-for'] as string,
        'x-va-server': '1',
        cookie: requestHeaders.cookie as string,
        ...(BYPASS_SECRET
          ? { 'x-vercel-protection-bypass': BYPASS_SECRET }
          : {}),
      },
      body: JSON.stringify(body),
      method: 'POST',
    })
      // We want to always consume the body; some cloud providers track fetch concurrency
      // and may not release the connection until the body is consumed.
      .then((response) => response.text())
      .catch((err: unknown) => {
        if (err instanceof Error && 'response' in err) {
          console.error(err.response);
        } else {
          console.error(err);
        }
      });

    if (requestContext?.waitUntil) {
      requestContext.waitUntil(promise);
    } else {
      await promise;
    }
  } catch (err) {
    console.error(err);
  }
}
