import { configureStore } from '@reduxjs/toolkit'
import { submissionsApi } from './api'
import { errorMiddleware } from './errorMiddleware'

export const store = configureStore({
	reducer: {
		[submissionsApi.reducerPath]: submissionsApi.reducer,
	},
	middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(submissionsApi.middleware, errorMiddleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
