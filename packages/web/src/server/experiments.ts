import { isProduction, parseProperties, truncateString } from '../utils';
import type { ServerExposureInput } from './experiments-types';
import {
  dispatch,
  type Options,
  rejectBrowserRuntime,
  reportMissingEndpoint,
  resolveEndpoint,
} from './request';

/** Exposures carry their own attribution, so flags do not apply to them. */
export type ExposureOptions = Omit<Options, 'flags'>;

/**
 * Reports that a unit was exposed to an experiment variant. Server-side only.
 *
 * @experimental
 * @param input - The exposure to report, plus the `userId`, `groupId` and
 * `props` attribution you want to attach to it.
 * @param [options] - Pass `request` or `headers` when the function runs
 * outside of a Vercel Function, where no request context is available.
 */
export async function trackExposure(
  input: ServerExposureInput,
  options?: ExposureOptions,
): Promise<void> {
  if (rejectBrowserRuntime('trackExposure')) {
    return;
  }

  const endpoint = resolveEndpoint('exposure');
  const props = parseProperties(input.props, {
    strip: isProduction(),
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
      ...(input.userId !== undefined && {
        userId: truncateString(input.userId),
      }),
      ...(input.groupId !== undefined && {
        groupId: truncateString(input.groupId),
      }),
      ...(props && Object.keys(props).length > 0 && { props }),
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
