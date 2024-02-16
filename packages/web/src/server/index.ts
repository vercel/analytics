/* eslint-disable no-console -- Allow logging on the server */
import type { AllowedPropertyValues } from '../types';
import { isProduction, parseProperties } from '../utils';

type HeadersObject = Record<string, string | string[] | undefined>;
type AllowedHeaders = Headers | HeadersObject;

function isHeaders(headers?: AllowedHeaders): headers is Headers {
  if (!headers) return false;
  return typeof (headers as HeadersObject).entries === 'function';
}

interface ContextWithRequest {
  request: { headers: AllowedHeaders };
}
interface ContextWithHeaders {
  headers: AllowedHeaders;
}

type Context = ContextWithRequest | ContextWithHeaders;

interface RequestContext {
  get: () => {
    headers: Record<string, string | undefined>;
    url: string;
    waitUntil?: (promise: Promise<unknown>) => void;
  };
}

const symbol = Symbol.for('@vercel/request-context');
const logPrefix = '[Vercel Web Analytics]';

export async function track(
  eventName: string,
  properties?: Record<string, AllowedPropertyValues>,
  context?: Context
): Promise<void> {
  const ENDPOINT =
    process.env.VERCEL_WEB_ANALYTICS_ENDPOINT || process.env.VERCEL_URL;
  const DISABLE_LOGS = Boolean(process.env.VERCEL_WEB_ANALYTICS_DISABLE_LOGS);
  const BYPASS_SECRET = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

  if (typeof window !== 'undefined') {
    if (!isProduction()) {
      throw new Error(
        `${logPrefix} It seems like you imported the \`track\` function from \`@vercel/web-analytics/server\` in a browser environment. This function is only meant to be used in a server environment.`
      );
    }

    return;
  }

  const props = parseProperties(properties, {
    strip: isProduction(),
  });

  if (!ENDPOINT) {
    if (isProduction()) {
      console.log(
        `${logPrefix} Can't find VERCEL_URL in environment variables.`
      );
    } else if (!DISABLE_LOGS) {
      console.log(
        `${logPrefix} Track "${eventName}" ${
          props ? `with data ${JSON.stringify(props)}` : ''
        }`
      );
    }
    return;
  }
  try {
    const requestContext = (
      (globalThis as never)[symbol] as RequestContext | undefined
    )?.get();

    let headers: AllowedHeaders | undefined;

    if (context && 'headers' in context) {
      headers = context.headers;
    } else if (context?.request) {
      headers = context.request.headers;
    } else if (requestContext?.headers) {
      // not explicitly passed in context, so take it from async storage
      headers = requestContext.headers;
    }

    let tmp: HeadersObject = {};
    if (headers && isHeaders(headers)) {
      headers.forEach((value, key) => {
        tmp[key] = value;
      });
    } else if (headers) {
      tmp = headers;
    }

    const origin =
      requestContext?.url || (tmp.referer as string) || `https://${ENDPOINT}`;

    const url = new URL(origin);

    const body = {
      o: origin,
      ts: new Date().getTime(),
      r: '',
      en: eventName,
      ed: props,
    };

    const hasHeaders = Boolean(headers);

    if (!hasHeaders) {
      throw new Error(
        'No session context found. Pass `request` or `headers` to the `track` function.'
      );
    }

    const promise = fetch(`${url.origin}/_vercel/insights/event`, {
      headers: {
        'content-type': 'application/json',
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- The throwing is temporary until we add support for non Vercel hosted environments
        ...(hasHeaders
          ? {
              'user-agent': tmp['user-agent'] as string,
              'x-vercel-ip': tmp['x-forwarded-for'] as string,
              'x-va-server': '1',
              cookie: tmp.cookie as string,
            }
          : {
              'x-va-server': '2',
            }),
        ...(BYPASS_SECRET
          ? { 'x-vercel-protection-bypass': BYPASS_SECRET }
          : {}),
      },
      body: JSON.stringify(body),
      method: 'POST',
    })
      // We want to always consume to body; some cloud providers track fetch concurrency
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

    return void 0;
  } catch (err) {
    console.error(err);
  }
}
