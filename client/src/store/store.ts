import { configureStore } from '@reduxjs/toolkit'
import { submissionsApi } from './api'
import { errorMiddleware } from './errorMiddleware'
import { successMiddleware } from './successMiddleware'

export const store = configureStore({
	reducer: {
		[submissionsApi.reducerPath]: submissionsApi.reducer,
	},
	middleware: (getDefaultMiddleware) => 
		getDefaultMiddleware().concat(
			submissionsApi.middleware, 
			errorMiddleware,
			successMiddleware
		),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
