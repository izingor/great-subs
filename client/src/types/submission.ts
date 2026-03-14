import type { SubmissionStatus } from "./submission-status";

export type Submission = {
  readonly id: string;
  readonly name: string;
  readonly status: SubmissionStatus;
  readonly created_at: string;
  readonly updated_at: string;
  readonly claimed_at: string | null;
};
