import type { Middleware } from '@reduxjs/toolkit'
import { isFulfilled } from '@reduxjs/toolkit'
import { toast } from 'react-toastify'

export const successMiddleware: Middleware = () => (next) => (action) => {
	if (isFulfilled(action)) {
		const payload = action.payload as { message?: string }
		if (payload?.message) {
			toast.success(payload.message)
		}
	}

	return next(action)
}
