import type { Submission } from "./submission";

export type BindResponse = {
  readonly submission: Submission;
  readonly attempts: number;
  readonly message?: string;
};
