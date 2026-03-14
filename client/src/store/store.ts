import { configureStore } from "@reduxjs/toolkit";
import { submissionsApi } from "./slices";
import { errorMiddleware, successMiddleware } from "./middlewares";

export const store = configureStore({
  reducer: {
    [submissionsApi.reducerPath]: submissionsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      submissionsApi.middleware,
      errorMiddleware,
      successMiddleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
