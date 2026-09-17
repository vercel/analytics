import type { AllowedPropertyValues, InternalOptions } from '../types';
import { isProduction, parseProperties, truncateString } from '../utils';
import {
  dispatch,
  type Options,
  rejectBrowserRuntime,
  reportMissingEndpoint,
  resolveEndpoint,
} from './request';

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
