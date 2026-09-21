import type {
  AllowedPropertyValues,
  InternalOptions,
  PlainFlags,
} from '../types';
import { isProduction, parseProperties } from '../utils';
import { type Attribution, attributionPayload } from './attribution';
import {
  dispatch,
  type Options,
  type ResolvedRequestContext,
  rejectBrowserRuntime,
  reportMissingEndpoint,
  resolveEndpoint,
} from './request';

export interface TrackOptions extends Options, Attribution {}

/**
 * Tracks a custom event. Server-side only.
 *
 * The server keeps no profile: pass `userId`, `groupId` and `props` when you
 * know them, for example from your session.
 *
 * @param eventName - The name of the event.
 * @param [properties] - Additional properties of the event. Nested objects are not supported. Allowed values are `string`, `number`, `boolean`, and `null`.
 * @param [options.flags] - Feature flags to attach to the event.
 * @param [options.userId] - The user the event is attributed to.
 * @param [options.groupId] - The group the event is attributed to.
 * @param [options.props] - Traits of the user and group, like `plan` or `role`. Same constraints as `properties`.
 * @param [options.request] / [options.headers] - Pass them when the function runs outside of a Vercel Function, where no request context is available.
 */
export async function track(
  eventName: string,
  properties?: Record<string, AllowedPropertyValues>,
  options?: TrackOptions,
): Promise<void>;
export async function track(
  eventName: string,
  properties?: Record<string, AllowedPropertyValues>,
  options?: TrackOptions & InternalOptions,
): Promise<void> {
  if (rejectBrowserRuntime('track')) {
    return;
  }

  const endpoint = resolveEndpoint('event');
  const props = parseProperties(properties, {
    strip: isProduction(),
  });
  const attribution = attributionPayload(options);

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
      ...attribution,
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

export type { Attribution, ProfileOptions } from './attribution';
export { group, identify } from './attribution';
export type {
  ExposureAssignmentReason,
  ExposureInput,
  ExposureOptions,
  ExposureUnitKey,
  ServerExposureInput,
} from './experiments';
export { trackExposure } from './experiments';
