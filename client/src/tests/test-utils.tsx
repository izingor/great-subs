import React from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { submissionsApi } from "@/store";
import { ColorModeContext } from "@/providers";
import { vi } from "vitest";

interface ExtendedRenderOptions extends Omit<RenderOptions, "queries"> {
  readonly preloadedState?: Partial<any>;
  readonly store?: any;
  readonly themeMode?: "light" | "dark";
  readonly toggleColorMode?: () => void;
}

export const renderWithProviders = (
  ui: React.ReactElement,
  {
    themeMode = "light",
    toggleColorMode = vi.fn(),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) => {
  const store = configureStore({
    reducer: {
      [submissionsApi.reducerPath]: submissionsApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }).concat(
        submissionsApi.middleware
      ),
  });

  const theme = createTheme({
    palette: {
      mode: themeMode,
    },
  });

  const Wrapper = ({ children }: { readonly children: React.ReactNode }) => (
    <Provider store={store}>
      <ColorModeContext.Provider value={{ toggleColorMode }}>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </ColorModeContext.Provider>
    </Provider>
  );

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};

export * from "@testing-library/react";
