import type { Middleware } from '@reduxjs/toolkit'
import { isRejectedWithValue } from '@reduxjs/toolkit'
import { toast } from 'react-toastify'

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
		const payload = action.payload as { 
			status?: number; 
			data?: { detail?: string | { msg: string }[] } 
		}
		
		let message = HTTP_ERROR_MESSAGES[payload.status ?? 0] ?? DEFAULT_ERROR_MESSAGE

		if (payload.data?.detail) {
			if (typeof payload.data.detail === 'string') {
				message = payload.data.detail
			} else if (Array.isArray(payload.data.detail) && payload.data.detail[0]?.msg) {
				// Handle FastAPI validation errors
				message = payload.data.detail[0].msg
			}
		}

		toast.error(message)
	}

	return next(action)
}
