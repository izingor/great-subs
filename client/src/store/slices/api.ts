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
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({
                type: "Submission" as const,
                id,
              })),
              { type: "Submissions", id: "PARTIAL-LIST" },
            ]
          : [{ type: "Submissions", id: "PARTIAL-LIST" }],
    }),

    getSubmission: builder.query<Submission, string>({
      query: (id) => `/submissions/${id}`,
      providesTags: (result, error, id) => [{ type: "Submission", id }],
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
      invalidatesTags: [{ type: "Submissions", id: "PARTIAL-LIST" }],
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
      async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          submissionsApi.util.updateQueryData("getSubmission", id, (draft) => {
            Object.assign(draft, data);
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, arg) => [
        { type: "Submission", id: arg.id },
      ],
    }),

    deleteSubmission: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/submissions/${id}`,
        method: "DELETE",
        body: undefined,
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Submission", id },
        { type: "Submissions", id: "PARTIAL-LIST" },
      ],
    }),

    bindSubmission: builder.mutation<BindResponse, string>({
      query: (id) => ({
        url: `/submissions/${id}/bind`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Submission", id }],
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
