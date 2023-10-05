// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-console */
import 'server-only';
import type { AllowedPropertyValues } from '../types';
import { isProduction, parseProperties } from '../utils';

const ENDPOINT = process.env.VERCEL_URL || process.env.VERCEL_ANALYTICS_URL;

const DISABLE_LOGS = Boolean(process.env.VERCEL_WEB_ANALYTICS_DISABLE_LOGS);

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

export async function track(
  eventName: string,
  properties?: Record<string, AllowedPropertyValues>,
  context?: Context,
): Promise<void> {
  const props = parseProperties(properties, {
    strip: isProduction(),
  });

  if (!ENDPOINT) {
    if (isProduction()) {
      console.log(
        `[Vercel Web Analytics] Can't find VERCEL_URL in environment variables.`,
      );
    } else if (!DISABLE_LOGS) {
      console.log(
        `[Vercel Web Analytics] Track "${eventName}" ${
          props ? `with data ${JSON.stringify(props)}` : ''
        }`,
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

    const origin = requestContext?.url || tmp.referer || `https://${ENDPOINT}`;

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
        'No session context found. Pass `request` or `headers` to the `track` function.',
      );
    }

    const promise = fetch(`https://${ENDPOINT}/_vercel/insights/event`, {
      headers: {
        'content-type': 'application/json',
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- The throwing is temporary until we add support for non Vercel hosted environments
        ...(hasHeaders
          ? {
              'user-agent': tmp['user-agent'] as string,
              'x-vercel-ip': tmp['x-forwarded-for'] as string,
              'x-va-server': '1',
            }
          : {
              'x-va-server': '2',
            }),
      },
      body: JSON.stringify(body),
      method: 'POST',
    }).catch((err: unknown) => {
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
