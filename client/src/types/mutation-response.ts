export type MutationResponse<T> = {
  readonly message: string;
  readonly data: T;
};
