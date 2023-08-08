// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-console */
import type { AllowedPropertyValues } from '../types';
import type { StorageData } from './request-context';

export { withSessionContext } from './request-context';

const ENDPOINT = process.env.VERCEL_URL || process.env.VERCEL_ANALYTICS_URL;
const ENV = process.env.NODE_ENV;
const IS_DEV = ENV === 'development';

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

export async function track(
  eventName: string,
  properties?: Record<string, AllowedPropertyValues>,
  context?: Context,
): Promise<void> {
  if (!ENDPOINT && !IS_DEV) {
    console.log(
      `[Vercel Web Analytics] Can't find VERCEL_URL in environment variables.`,
    );
    return;
  }
  try {
    const store: StorageData | undefined =
      globalThis.__unsafeRequestStorage?.getStore();

    let headers: AllowedHeaders | undefined;

    if (context && 'headers' in context) {
      headers = context.headers;
    } else if (context?.request) {
      headers = context.request.headers;
    } else if (store?.request.headers) {
      // not explicitly passed in context, so take it from async storage
      headers = store.request.headers;
    }

    if (!ENDPOINT && IS_DEV) {
      console.log(
        `[Vercel Web Analytics] Track "${eventName}" ${
          properties ? ` with data ${JSON.stringify(properties)}` : ''
        }`,
      );
      return;
    }

    let tmp: HeadersObject = {};
    if (headers && isHeaders(headers)) {
      headers.forEach((value, key) => {
        tmp[key] = value;
      });
    } else if (headers) {
      tmp = headers;
    }

    const body = {
      o: tmp.referer,
      ts: new Date().getTime(),
      r: '',
      en: eventName,
      ed: properties,
    };

    const hasHeaders = Boolean(headers);

    if (!hasHeaders) {
      throw new Error(
        'No headers or request found. Please use `withSessionContext` to wrap your request handler or pass in `request` order `headers` to `track`.',
      );
    }

    if (!ENDPOINT) {
      throw new Error(
        'VERCEL_URL is not defined in the environment variables.',
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

    await promise;

    return void 0;
  } catch (err) {
    console.error(err);
  }
}
