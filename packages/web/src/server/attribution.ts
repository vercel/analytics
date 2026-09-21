import type { AllowedPropertyValues, InternalOptions } from '../types';
import { isProduction, parseProperties, truncateString } from '../utils';
import {
  dispatch,
  type Options,
  rejectBrowserRuntime,
  reportMissingEndpoint,
  resolveEndpoint,
} from './request';

/**
 * Who an event is about: the `identify`/`group` profile senders, and the
 * attribution fields every other sender attaches to its payload.
 *
 * In the browser, the script remembers the last `identify()` and `group()`
 * calls and attaches them to every event. The server keeps no such state, so
 * callers pass them explicitly when they know them.
 */

export interface Attribution {
  /** The user the event is attributed to. */
  userId?: string;
  /** The group (team, organization...) the event is attributed to. */
  groupId?: string;
  /**
   * Traits of the user and group at the time of the event, like `plan` or
   * `role`. Nested objects are not supported. Allowed values are `string`,
   * `number`, `boolean`, and `null`.
   */
  props?: Record<string, AllowedPropertyValues>;
}

/**
 * The attribution fields of a payload, validated and truncated like the
 * browser script does before sending them. Call it before `dispatch()`, so
 * invalid `props` throw in development like invalid event properties do.
 */
export function attributionPayload(
  attribution: Attribution | undefined,
): Attribution {
  // `parseProperties` throws on invalid input; it never returns the `Error`
  // its signature mentions.
  const props = parseProperties(attribution?.props, {
    strip: isProduction(),
  }) as Record<string, AllowedPropertyValues> | undefined;

  return {
    ...(attribution?.userId !== undefined && {
      userId: truncateString(attribution.userId),
    }),
    ...(attribution?.groupId !== undefined && {
      groupId: truncateString(attribution.groupId),
    }),
    ...(props && Object.keys(props).length > 0 && { props }),
  };
}

/** Profile mutations carry no flags: they describe who, not what happened. */
export type ProfileOptions = Omit<Options, 'flags'>;

/**
 * `identify` and `group` share everything but their name and identifier key.
 * They post to their own endpoints and carry traits in `ed`, where custom
 * events carry their properties.
 */
async function trackProfile(
  name: 'identify' | 'group',
  idKey: 'userId' | 'groupId',
  id: string,
  traits: Record<string, AllowedPropertyValues> | undefined,
  options: (ProfileOptions & InternalOptions) | undefined,
): Promise<void> {
  if (rejectBrowserRuntime(name)) {
    return;
  }

  const endpoint = resolveEndpoint(name);
  const parsedTraits = parseProperties(traits, {
    strip: isProduction(),
  });

  if (!endpoint) {
    const label = name === 'identify' ? 'Identify' : 'Group';
    reportMissingEndpoint(
      `${label} "${id}" ${parsedTraits ? `with traits ${JSON.stringify(parsedTraits)}` : ''}`,
    );
    return;
  }

  await dispatch({
    endpoint,
    fnName: name,
    options,
    payload: () => ({
      en: name,
      [idKey]: truncateString(id),
      ...(parsedTraits &&
        Object.keys(parsedTraits).length > 0 && { ed: parsedTraits }),
    }),
  });
}

/**
 * Associates the current visitor with a user. Server-side only.
 *
 * @param userId - The identifier of the user.
 * @param [traits] - Additional traits of the user. Nested objects are not supported. Allowed values are `string`, `number`, `boolean`, and `null`.
 * @param [options] - Pass `request` or `headers` when the function runs
 * outside of a Vercel Function, where no request context is available.
 */
export async function identify(
  userId: string,
  traits?: Record<string, AllowedPropertyValues>,
  options?: ProfileOptions,
): Promise<void>;
export async function identify(
  userId: string,
  traits?: Record<string, AllowedPropertyValues>,
  options?: ProfileOptions & InternalOptions,
): Promise<void> {
  await trackProfile('identify', 'userId', userId, traits, options);
}

/**
 * Associates the current visitor with a group, like a team or an organization.
 * Server-side only.
 *
 * @param groupId - The identifier of the group.
 * @param [traits] - Additional traits of the group. Nested objects are not supported. Allowed values are `string`, `number`, `boolean`, and `null`.
 * @param [options] - Pass `request` or `headers` when the function runs
 * outside of a Vercel Function, where no request context is available.
 */
export async function group(
  groupId: string,
  traits?: Record<string, AllowedPropertyValues>,
  options?: ProfileOptions,
): Promise<void>;
export async function group(
  groupId: string,
  traits?: Record<string, AllowedPropertyValues>,
  options?: ProfileOptions & InternalOptions,
): Promise<void> {
  await trackProfile('group', 'groupId', groupId, traits, options);
}
