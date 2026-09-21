import type { InternalOptions } from '../types';
import { type Attribution, attributionPayload } from './attribution';
import type { ServerExposureInput } from './experiments-types';
import {
  dispatch,
  type Options,
  rejectBrowserRuntime,
  reportMissingEndpoint,
  resolveEndpoint,
} from './request';

/**
 * Exposures carry their own attribution, so flags do not apply to them.
 * Attribution can be passed here, like for `track()`, and takes precedence
 * over the same fields on the exposure input.
 */
export interface ExposureOptions extends Omit<Options, 'flags'>, Attribution {}

/**
 * Reports that a unit was exposed to an experiment variant. Server-side only.
 *
 * @experimental
 * @param input - The exposure to report. It can carry the `userId`, `groupId`
 * and `props` attribution too.
 * @param [options.userId] - The user the exposure is attributed to.
 * @param [options.groupId] - The group the exposure is attributed to.
 * @param [options.props] - Traits of the user and group, like `plan` or `role`.
 * @param [options.request] / [options.headers] - Pass them when the function runs
 * outside of a Vercel Function, where no request context is available.
 */
export async function trackExposure(
  input: ServerExposureInput,
  options?: ExposureOptions,
): Promise<void>;
export async function trackExposure(
  input: ServerExposureInput,
  options?: ExposureOptions & InternalOptions,
): Promise<void> {
  if (rejectBrowserRuntime('trackExposure')) {
    return;
  }

  const endpoint = resolveEndpoint('exposure');
  const attribution = attributionPayload({
    userId: options?.userId ?? input.userId,
    groupId: options?.groupId ?? input.groupId,
    props: options?.props ?? input.props,
  });

  const data = {
    // experimentId is sent as `en`, so it is left out of `ed`
    variantId: input.variantId,
    unitKey: input.unitKey,
    unitValue: input.unitValue,
    ...(input.assignmentReason !== undefined && {
      assignmentReason: input.assignmentReason,
    }),
    ...(input.rampId !== undefined && { rampId: input.rampId }),
    ...(input.rampPercentage !== undefined && {
      rampPercentage: input.rampPercentage,
    }),
  };

  if (!endpoint) {
    reportMissingEndpoint(
      `Exposure "${input.experimentId}:${input.variantId}" with data ${JSON.stringify(data)}`,
    );
    return;
  }

  await dispatch({
    endpoint,
    fnName: 'trackExposure',
    options,
    payload: () => ({
      ...attribution,
      en: input.experimentId,
      ed: data,
    }),
  });
}

export type {
  ExposureAssignmentReason,
  ExposureInput,
  ExposureUnitKey,
  ServerExposureInput,
} from './experiments-types';
