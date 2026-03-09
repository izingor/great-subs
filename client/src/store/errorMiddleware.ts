import type { Middleware } from '@reduxjs/toolkit'
import { isRejectedWithValue } from '@reduxjs/toolkit'
import { toast } from 'sonner'

const HTTP_ERROR_MESSAGES: Record<number, string> = {
	400: 'Invalid request. Please check your input.',
	404: 'The requested submission was not found.',
	409: 'This submission is already being processed.',
	422: 'Please check the form fields and try again.',
	500: 'Something went wrong on our end. Please try again later.',
}

const DEFAULT_ERROR_MESSAGE = 'An unexpected error occurred. Please try again.'

export const errorMiddleware: Middleware = () => (next) => (action) => {
	if (isRejectedWithValue(action)) {
		const status = (action.payload as { status?: number })?.status
		const message = (status && HTTP_ERROR_MESSAGES[status]) ?? DEFAULT_ERROR_MESSAGE
		toast.error(message)
	}

	return next(action)
}
