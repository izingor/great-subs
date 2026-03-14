import type { Submission } from "./submission";

export type PaginatedSubmissions = {
  readonly items: Submission[];
  readonly total: number;
  readonly page: number;
  readonly size: number;
};
