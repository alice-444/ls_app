import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

describe("Select", () => {
  it("renders trigger with placeholder", () => {
    render(
      <Select onValueChange={vi.fn()}>
        <SelectTrigger>
          <SelectValue placeholder="Choose one" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Option A</SelectItem>
          <SelectItem value="b">Option B</SelectItem>
        </SelectContent>
      </Select>
    );
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByText("Choose one")).toBeInTheDocument();
  });

  it("renders trigger with selected value when value is controlled", () => {
    render(
      <Select value="b" onValueChange={vi.fn()}>
        <SelectTrigger>
          <SelectValue placeholder="Choose" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Option A</SelectItem>
          <SelectItem value="b">Option B</SelectItem>
        </SelectContent>
      </Select>
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("Option B");
  });

  it("is disabled when disabled prop is passed to trigger", () => {
    render(
      <Select disabled onValueChange={vi.fn()}>
        <SelectTrigger disabled>
          <SelectValue placeholder="Choose" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
        </SelectContent>
      </Select>
    );
    expect(screen.getByRole("combobox")).toBeDisabled();
  });
});
