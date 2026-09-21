import type { Attribution } from './attribution';

/**
 * Which unit an exposure applies to.
 *
 * `user`, `device` and `group` point at the attribution that the SDK attaches
 * to every event itself. Do not put these in the data of your `track()` calls.
 *
 * `event_data.${property}` points at a property in the data of your `track()`
 * calls. So `event_data.user` is a `user` property that you send yourself,
 * which is a different unit than `user`.
 */
export type ExposureUnitKey =
  | 'user'
  | 'device'
  | 'group'
  | `event_data.${string}`;

export type ExposureAssignmentReason =
  | 'experiment'
  | 'not-enrolled'
  | 'targeted'
  | 'split'
  | 'variant'
  | 'rollout'
  | 'override';

export interface ExposureInput {
  experimentId: string;
  variantId: string;
  unitKey: ExposureUnitKey;
  unitValue: string;
  assignmentReason?: ExposureAssignmentReason;
  rampId?: string;
  rampPercentage?: number;
}

/**
 * The browser runtime reads `userId`, `groupId` and `props` from persisted
 * attribution state, which does not exist on the server. Pass them explicitly.
 */
export interface ServerExposureInput extends ExposureInput, Attribution {}
