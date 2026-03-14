import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { CustomSelectBox } from "@/components/inputs/CustomSelectBox";
import { renderWithProviders } from "./test-utils";

describe("CustomSelectBox", () => {
  const options = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
  ];

  it("renders with correct initial value", () => {
    renderWithProviders(
      <CustomSelectBox 
        value="option1" 
        onChange={vi.fn()} 
        options={options} 
      />
    );

    expect(screen.getByText("Option 1")).toBeInTheDocument();
  });

  it("calls onChange when an option is selected", () => {
    const onChange = vi.fn();
    renderWithProviders(
      <CustomSelectBox 
        value="option1" 
        onChange={onChange} 
        options={options} 
      />
    );

    // Click to open the select
    fireEvent.mouseDown(screen.getByRole("combobox"));

    // Click the second option
    const option2 = screen.getByRole("option", { name: "Option 2" });
    fireEvent.click(option2);

    expect(onChange).toHaveBeenCalledWith("option2");
  });
});
