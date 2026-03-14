import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SubmissionsPage } from "@/pages";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { submissionsApi } from "@/store";
import { ThemeProvider } from "@mui/material/styles";
import { createTheme } from "@mui/material";

// Mock the API module
vi.mock("@/store", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/store")>();
  return {
    ...actual,
    useGetSubmissionsQuery: vi.fn(),
  };
});

import { useGetSubmissionsQuery } from "@/store";

// Minimal render wrapper for tests
const renderWithProviders = (ui: React.ReactElement) => {
  const store = configureStore({
    reducer: {
      [submissionsApi.reducerPath]: submissionsApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }).concat(
        submissionsApi.middleware,
      ),
  });

  const theme = createTheme({});

  return render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>{ui}</ThemeProvider>
    </Provider>,
  );
};

describe("SubmissionsPage Pagination UI", () => {
  const mockUseGetSubmissionsQuery =
    useGetSubmissionsQuery as unknown as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly with loading state", () => {
    mockUseGetSubmissionsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    renderWithProviders(<SubmissionsPage />);

    expect(screen.getByText(/Loading submissions…/i)).toBeInTheDocument();
  });

  it("renders table with data and displays pagination controls", async () => {
    const mockItems = Array.from({ length: 5 }).map((_, i) => ({
      id: i + 1,
      name: `Submission ${i + 1}`,
      status: "new",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      claimed_at: null,
    }));

    mockUseGetSubmissionsQuery.mockReturnValue({
      data: {
        items: mockItems,
        total: 25,
        page: 1,
        size: 5,
      },
      isLoading: false,
    });

    renderWithProviders(<SubmissionsPage />);

    // Check if items are rendered
    expect(screen.getByText("Submission 1")).toBeInTheDocument();
    expect(screen.getByText("Submission 5")).toBeInTheDocument();

    // Check pagination footer
    expect(screen.getByText(/of 25/)).toBeInTheDocument();
  });

  it("changes to the next page when the next button is clicked", async () => {
    mockUseGetSubmissionsQuery.mockReturnValue({
      data: {
        items: [{ id: 1, name: "dummy", status: "new" }],
        total: 25,
        page: 1,
        size: 10,
      },
      isLoading: false,
    });

    renderWithProviders(<SubmissionsPage />);

    // MUI uses 'Go to next page' usually, or title='Go to next page'
    const nextPageButton = screen.getByRole("button", { name: /next page/i });
    fireEvent.click(nextPageButton);

    // The hook should have been called again with page=2 inside queryParams
    await waitFor(() => {
      expect(mockUseGetSubmissionsQuery).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 }),
      );
    });
  });

  it("resets page to 1 when a filter is applied", async () => {
    mockUseGetSubmissionsQuery.mockReturnValue({
      data: {
        items: [{ id: 1, name: "dummy", status: "new" }],
        total: 25,
        page: 3, // We pretend we are on page 3
        size: 10,
      },
      isLoading: false,
    });

    renderWithProviders(<SubmissionsPage />);

    // Click the status dropdown (the first combobox is the status filter)
    const comboboxes = screen.getAllByRole("combobox");
    fireEvent.mouseDown(comboboxes[0]);

    // Click 'Bound'
    const boundOption = screen.getByRole("option", { name: /Bound/i });
    fireEvent.click(boundOption);

    // Should reset to page 1 and set status 'bound'
    await waitFor(() => {
      expect(mockUseGetSubmissionsQuery).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, status: "bound" }),
      );
    });
  });
});
