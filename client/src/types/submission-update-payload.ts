import type { SubmissionStatus } from "./submission-status";

export type SubmissionUpdatePayload = {
  readonly name?: string;
  readonly status?: SubmissionStatus;
};
