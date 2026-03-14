import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BindResponse,
  MutationResponse,
  PaginatedSubmissions,
  Submission,
  SubmissionCreatePayload,
  SubmissionUpdatePayload,
} from "@/types";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const submissionsApi = createApi({
  reducerPath: "submissionsApi",
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ["Submissions", "Submission"],
  endpoints: (builder) => ({
    getSubmissions: builder.query<
      PaginatedSubmissions,
      { status?: string; name?: string; page?: number; size?: number }
    >({
      query: (params) => ({
        url: "/submissions/",
        params: {
          ...(params.status && { status: params.status }),
          ...(params.name && { name: params.name }),
          ...(params.page && { page: params.page }),
          ...(params.size && { size: params.size }),
        },
      }),
      providesTags: ["Submissions"],
    }),

    getSubmission: builder.query<Submission, string>({
      query: (id) => `/submissions/${id}`,
      providesTags: ["Submission"],
    }),

    createSubmission: builder.mutation<
      MutationResponse<Submission>,
      SubmissionCreatePayload
    >({
      query: (body) => ({
        url: "/submissions/",
        method: "POST",
        body,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled, getState }) {
        try {
          const { data: response } = await queryFulfilled;
          const newSubmission = response.data;

          const state = getState() as any;
          const apiState = state.submissionsApi;

          Object.values(apiState.queries || {}).forEach((query: any) => {
            if (query?.endpointName === "getSubmissions") {
              dispatch(
                submissionsApi.util.updateQueryData(
                  "getSubmissions",
                  query.originalArgs,
                  (draft: any) => {
                    // Only add to the first page if we are on the first page or if it's not paginated
                    if (
                      !query.originalArgs?.page ||
                      query.originalArgs.page === 1
                    ) {
                      draft.items.unshift(newSubmission);
                      if (
                        draft.items.length > (query.originalArgs?.size ?? 10)
                      ) {
                        draft.items.pop();
                      }
                    }
                    draft.total += 1;
                  },
                ),
              );
            }
          });
        } catch {
          // No need to undo as we only update on success
        }
      },
    }),

    updateSubmission: builder.mutation<
      MutationResponse<Submission>,
      { id: string; data: SubmissionUpdatePayload }
    >({
      query: ({ id, data }) => ({
        url: `/submissions/${id}`,
        method: "PATCH",
        body: data,
      }),
      async onQueryStarted(
        { id, data },
        { dispatch, queryFulfilled, getState },
      ) {
        const state = getState() as any;
        const apiState = state.submissionsApi;

        // Optimistically update getSubmission
        const patchResult1 = dispatch(
          submissionsApi.util.updateQueryData(
            "getSubmission",
            id,
            (draft: any) => {
              Object.assign(draft, data);
            },
          ),
        );

        // Optimistically update getSubmissions list entries
        const patchesList: any[] = [];
        Object.values(apiState.queries || {}).forEach((query: any) => {
          if (query?.endpointName === "getSubmissions") {
            const patchResult = dispatch(
              submissionsApi.util.updateQueryData(
                "getSubmissions",
                query.originalArgs,
                (draft: any) => {
                  const item = draft.items.find((i: any) => i.id === id);
                  if (item) {
                    Object.assign(item, data);
                  }
                },
              ),
            );
            patchesList.push(patchResult);
          }
        });

        try {
          const { data: response } = await queryFulfilled;
          const updatedSubmission = response.data;

          // Update with actual data from server
          dispatch(
            submissionsApi.util.updateQueryData(
              "getSubmission",
              id,
              (draft: any) => {
                Object.assign(draft, updatedSubmission);
              },
            ),
          );

          Object.values(apiState.queries || {}).forEach((query: any) => {
            if (query?.endpointName === "getSubmissions") {
              dispatch(
                submissionsApi.util.updateQueryData(
                  "getSubmissions",
                  query.originalArgs,
                  (draft: any) => {
                    const index = draft.items.findIndex(
                      (i: any) => i.id === id,
                    );
                    if (index !== -1) {
                      draft.items[index] = updatedSubmission;
                    }
                  },
                ),
              );
            }
          });
        } catch {
          patchResult1.undo();
          patchesList.forEach((p) => p.undo());
        }
      },
    }),

    deleteSubmission: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/submissions/${id}`,
        method: "DELETE",
        body: undefined,
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        const state = getState() as any;
        const apiState = state.submissionsApi;

        const patchesList: any[] = [];
        Object.values(apiState.queries || {}).forEach((query: any) => {
          if (query?.endpointName === "getSubmissions") {
            const patchResult = dispatch(
              submissionsApi.util.updateQueryData(
                "getSubmissions",
                query.originalArgs,
                (draft: any) => {
                  const index = draft.items.findIndex((i: any) => i.id === id);
                  if (index !== -1) {
                    draft.items.splice(index, 1);
                    draft.total -= 1;
                  }
                },
              ),
            );
            patchesList.push(patchResult);
          }
        });

        try {
          await queryFulfilled;
        } catch {
          patchesList.forEach((p) => p.undo());
        }
      },
    }),

    bindSubmission: builder.mutation<BindResponse, string>({
      query: (id) => ({
        url: `/submissions/${id}/bind`,
        method: "POST",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        try {
          const { data: response } = await queryFulfilled;
          const updatedSubmission = response.submission;

          const state = getState() as any;
          const apiState = state.submissionsApi;

          // Update getSubmission
          dispatch(
            submissionsApi.util.updateQueryData(
              "getSubmission",
              id,
              (draft: any) => {
                Object.assign(draft, updatedSubmission);
              },
            ),
          );

          // Update getSubmissions
          Object.values(apiState.queries || {}).forEach((query: any) => {
            if (query?.endpointName === "getSubmissions") {
              dispatch(
                submissionsApi.util.updateQueryData(
                  "getSubmissions",
                  query.originalArgs,
                  (draft: any) => {
                    const index = draft.items.findIndex(
                      (i: any) => i.id === id,
                    );
                    if (index !== -1) {
                      draft.items[index] = updatedSubmission;
                    }
                  },
                ),
              );
            }
          });
        } catch {
          const state = getState() as any;
          const apiState = state.submissionsApi;

          // Update getSubmission to failed status
          dispatch(
            submissionsApi.util.updateQueryData(
              "getSubmission",
              id,
              (draft: any) => {
                draft.status = "bind_failed";
              },
            ),
          );

          // Update getSubmissions list to failed status
          Object.values(apiState.queries || {}).forEach((query: any) => {
            if (query?.endpointName === "getSubmissions") {
              dispatch(
                submissionsApi.util.updateQueryData(
                  "getSubmissions",
                  query.originalArgs,
                  (draft: any) => {
                    const item = draft.items.find((i: any) => i.id === id);
                    if (item) {
                      item.status = "bind_failed";
                    }
                  },
                ),
              );
            }
          });
        }
      },
    }),
  }),
});

export const {
  useGetSubmissionsQuery,
  useGetSubmissionQuery,
  useCreateSubmissionMutation,
  useUpdateSubmissionMutation,
  useDeleteSubmissionMutation,
  useBindSubmissionMutation,
} = submissionsApi;
