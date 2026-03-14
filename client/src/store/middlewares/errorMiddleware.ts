import type { Middleware } from '@reduxjs/toolkit'
import { isRejectedWithValue } from '@reduxjs/toolkit'
import { toast } from 'react-toastify'

type ValidationError = { readonly msg: string }

type ErrorPayload = {
	readonly status?: number
	readonly data?: {
		readonly detail?: string | readonly ValidationError[]
		readonly message?: string
	}
}

const HTTP_ERROR_MESSAGES: Record<number, string> = {
	400: 'Invalid request. Please check your input.',
	404: 'The requested submission was not found.',
	409: 'This submission is already being processed.',
	422: 'Please check the form fields and try again.',
	500: 'Something went wrong on our end. Please try again later.',
}

const DEFAULT_ERROR_MESSAGE = 'An unexpected error occurred. Please try again.'

const extractErrorMessage = (payload: ErrorPayload): string => {
	const fallback = HTTP_ERROR_MESSAGES[payload.status ?? 0] ?? DEFAULT_ERROR_MESSAGE

	if (typeof payload.data?.detail === 'string') return payload.data.detail

	if (Array.isArray(payload.data?.detail) && payload.data.detail[0]?.msg) {
		return payload.data.detail[0].msg
	}

	if (payload.data?.message) return payload.data.message

	return fallback
}

export const errorMiddleware: Middleware = () => (next) => (action) => {
	if (isRejectedWithValue(action)) {
		toast.error(extractErrorMessage(action.payload as ErrorPayload))
	}

	return next(action)
}
