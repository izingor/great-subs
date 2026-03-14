import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { Header } from "@/components/Header/Header";
import { renderWithProviders } from "./test-utils";

describe("Header", () => {
  it("renders logo and application name", () => {
    renderWithProviders(<Header />);
    
    expect(screen.getByAltText("Sub Manager")).toBeInTheDocument();
    expect(screen.getByText("Subs Manager")).toBeInTheDocument();
  });

  it("renders children content", () => {
    renderWithProviders(
      <Header>
        <button data-testid="test-child">Test Button</button>
      </Header>
    );

    expect(screen.getByTestId("test-child")).toBeInTheDocument();
    expect(screen.getByText("Test Button")).toBeInTheDocument();
  });

  it("renders ThemeToggle", () => {
    renderWithProviders(<Header />);
    
    expect(screen.getByLabelText(/Toggle theme/i)).toBeInTheDocument();
  });
});
