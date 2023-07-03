// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-console */
import type { AllowedPropertyValues } from '../types';
import type { StorageData } from './request-context';

export { withRequestContext } from './request-context';

const ENDPOINT = process.env.VERCEL_URL;
const ENV = process.env.NODE_ENV;
const IS_DEV = ENV === 'development';

type HeadersObject = Record<string, string | string[] | undefined>;

function isHeaders(headers?: Headers | HeadersObject): headers is Headers {
  if (!headers) return false;
  return typeof (headers as HeadersObject).entries === 'function';
}

interface Context {
  request?: Request;
}

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

    const request = context?.request || store?.request;

    const headers = request?.headers as Headers | HeadersObject | undefined;

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

    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const promise = fetch(`https://${ENDPOINT}/_vercel/insights/event`, {
      headers: {
        'content-type': 'application/json',
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
      if (!(err instanceof Error)) return;
      if ('response' in err) {
        console.error(err.response);
      }
    });

    await promise;

    return void 0;
  } catch (err) {
    console.error(err);
  }
}
