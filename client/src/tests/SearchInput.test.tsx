import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { SearchInput } from "@/components/inputs/SearchInput";
import { renderWithProviders } from "./test-utils";

describe("SearchInput", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("renders with correct initial value", () => {
    renderWithProviders(
      <SearchInput value="test" onSearch={vi.fn()} />
    );
    
    expect(screen.getByDisplayValue("test")).toBeInTheDocument();
  });

  it("calls onSearch with debounce when typing", async () => {
    const onSearch = vi.fn();
    renderWithProviders(
      <SearchInput value="" onSearch={onSearch} delay={100} />
    );

    const input = screen.getByPlaceholderText(/Search…/i);
    fireEvent.change(input, { target: { value: "hello" } });

    // Should not be called immediately
    expect(onSearch).not.toHaveBeenCalled();

    // Fast-forward time
    vi.advanceTimersByTime(110);

    expect(onSearch).toHaveBeenCalledWith("hello");
  });

  it("clears input when clear button is clicked", () => {
    const onSearch = vi.fn();
    renderWithProviders(
      <SearchInput value="initial" onSearch={onSearch} />
    );

    const clearButton = screen.getByRole("button");
    fireEvent.click(clearButton);

    expect(screen.getByDisplayValue("")).toBeInTheDocument();
    expect(onSearch).toHaveBeenCalledWith("");
  });

  it("updates local state when value prop changes", () => {
    const { rerender } = renderWithProviders(
      <SearchInput value="first" onSearch={vi.fn()} />
    );

    expect(screen.getByDisplayValue("first")).toBeInTheDocument();

    rerender(<SearchInput value="second" onSearch={vi.fn()} />);

    expect(screen.getByDisplayValue("second")).toBeInTheDocument();
  });
});
