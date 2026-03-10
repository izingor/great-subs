import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { BindResponse, Submission, SubmissionCreatePayload, SubmissionUpdatePayload } from '@/types/submission'

const BASE_URL = 'http://localhost:8000'

export const submissionsApi = createApi({
	reducerPath: 'submissionsApi',
	baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
	tagTypes: ['Submission'],
	endpoints: (builder) => ({
		getSubmissions: builder.query<Submission[], { status?: string; name?: string }>({
			query: (params) => ({
				url: '/submissions/',
				params: {
					...(params.status && { status: params.status }),
					...(params.name && { name: params.name }),
				},
			}),
			providesTags: (result) =>
				result
					? [
							...result.map(({ id }) => ({ type: 'Submission' as const, id })),
							{ type: 'Submission', id: 'LIST' },
						]
					: [{ type: 'Submission', id: 'LIST' }],
		}),

		getSubmission: builder.query<Submission, number>({
			query: (id) => `/submissions/${id}`,
			providesTags: (_result, _error, id) => [{ type: 'Submission', id }],
		}),

		createSubmission: builder.mutation<Submission, SubmissionCreatePayload>({
			query: (body) => ({
				url: '/submissions/',
				method: 'POST',
				body,
			}),
			invalidatesTags: [{ type: 'Submission', id: 'LIST' }],
		}),

		updateSubmission: builder.mutation<Submission, { id: number; data: SubmissionUpdatePayload }>({
			query: ({ id, data }) => ({
				url: `/submissions/${id}`,
				method: 'PATCH',
				body: data,
			}),
			invalidatesTags: (_result, _error, { id }) => [
				{ type: 'Submission', id },
				{ type: 'Submission', id: 'LIST' },
			],
		}),

		deleteSubmission: builder.mutation<void, number>({
			query: (id) => ({
				url: `/submissions/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags: [{ type: 'Submission', id: 'LIST' }],
		}),

		bindSubmission: builder.mutation<BindResponse, number>({
			query: (id) => ({
				url: `/submissions/${id}/bind`,
				method: 'POST',
			}),
			invalidatesTags: (_result, _error, id) => [
				{ type: 'Submission', id },
				{ type: 'Submission', id: 'LIST' },
			],
		}),
	}),
})

export const {
	useGetSubmissionsQuery,
	useGetSubmissionQuery,
	useCreateSubmissionMutation,
	useUpdateSubmissionMutation,
	useDeleteSubmissionMutation,
	useBindSubmissionMutation,
} = submissionsApi
