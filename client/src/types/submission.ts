export type SubmissionStatus = 'new' | 'bound' | 'bind_failed'

export type Submission = {
	readonly id: number
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

export type BindResponse = {
	readonly submission: Submission
	readonly attempts: number
}
