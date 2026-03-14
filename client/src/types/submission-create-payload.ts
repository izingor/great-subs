import type { SubmissionStatus } from "./submission-status";

export type SubmissionCreatePayload = {
  readonly name: string;
  readonly status?: SubmissionStatus;
};
