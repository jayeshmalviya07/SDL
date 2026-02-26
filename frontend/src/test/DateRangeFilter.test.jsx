import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DateRangeFilter from "../components/common/DateRangeFilter";

describe("DateRangeFilter", () => {
  it("calls onFilter with start and end when button clicked", () => {
    const onFilter = vi.fn();
    render(<DateRangeFilter onFilter={onFilter} />);

    const [startInput, endInput] = screen.getAllByDisplayValue("");
    fireEvent.change(startInput, { target: { value: "2024-01-01" } });
    fireEvent.change(endInput, { target: { value: "2024-01-31" } });

    const button = screen.getByText(/Download Report/i);
    fireEvent.click(button);

    expect(onFilter).toHaveBeenCalledWith("2024-01-01", "2024-01-31");
  });

  it("renders download button", () => {
    render(<DateRangeFilter onFilter={vi.fn()} />);
    expect(screen.getByText(/Download Report/i)).toBeInTheDocument();
  });
});
