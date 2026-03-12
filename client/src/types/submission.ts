export type SubmissionStatus = 'new' | 'bound' | 'bind_failed'

export type Submission = {
	readonly id: string
	readonly name: string
	readonly status: SubmissionStatus
	readonly created_at: string
	readonly updated_at: string
	readonly claimed_at: string | null
}

export type SubmissionCreatePayload = {
	readonly name: string
	readonly status?: SubmissionStatus
}

export type SubmissionUpdatePayload = {
	readonly name?: string
	readonly status?: SubmissionStatus
}

export type MutationResponse<T> = {
	readonly message: string
	readonly data: T
}

export type BindResponse = {
	readonly submission: Submission
	readonly attempts: number
	readonly message?: string
}

export type PaginatedSubmissions = {
	readonly items: Submission[]
	readonly total: number
	readonly page: number
	readonly size: number
}

export type SubmissionsFilter = {
	readonly status: string
	readonly search: string
	readonly page: number
	readonly size: number
}
