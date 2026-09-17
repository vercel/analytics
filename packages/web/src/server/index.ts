import type {
  AllowedPropertyValues,
  InternalOptions,
  PlainFlags,
} from '../types';
import { isProduction, parseProperties } from '../utils';
import {
  dispatch,
  type Options,
  type ResolvedRequestContext,
  rejectBrowserRuntime,
  reportMissingEndpoint,
  resolveEndpoint,
} from './request';

export async function track(
  eventName: string,
  properties?: Record<string, AllowedPropertyValues>,
  options?: Options,
): Promise<void>;
export async function track(
  eventName: string,
  properties?: Record<string, AllowedPropertyValues>,
  options?: Options & InternalOptions,
): Promise<void> {
  if (rejectBrowserRuntime('track')) {
    return;
  }

  const endpoint = resolveEndpoint('event');
  const props = parseProperties(properties, {
    strip: isProduction(),
  });

  if (!endpoint) {
    reportMissingEndpoint(
      `Track "${eventName}" ${props ? `with data ${JSON.stringify(props)}` : ''}`,
    );
    return;
  }

  await dispatch({
    endpoint,
    fnName: 'track',
    options,
    payload: (requestContext) => ({
      en: eventName,
      ed: props,
      f: safeGetFlags(options?.flags, requestContext),
    }),
  });
}

function safeGetFlags(
  flags: Options['flags'],
  requestContext?: ResolvedRequestContext,
):
  | {
      p: PlainFlags;
    }
  | undefined {
  try {
    // In the case plain flags are passed, just return them
    if (flags && !Array.isArray(flags)) {
      return { p: flags };
    }

    if (!requestContext || !flags) return;
    const plainFlags: Record<string, unknown> = {};
    // returns all available plain flags
    const resolvedPlainFlags = requestContext.flags?.getValues() ?? {};

    for (const flag of flags) {
      if (typeof flag === 'string') {
        // only picks the desired flags
        plainFlags[flag] = resolvedPlainFlags[flag];
      } else {
        // merge user-provided values with resolved values
        Object.assign(plainFlags, flag);
      }
    }

    return { p: plainFlags };
  } catch {
    /* empty */
  }
}

export type {
  ExposureAssignmentReason,
  ExposureInput,
  ExposureOptions,
  ExposureUnitKey,
  ServerExposureInput,
} from './experiments';
export { trackExposure } from './experiments';
export type { ProfileOptions } from './profiles';
export { group, identify } from './profiles';
