import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Textarea } from "@/components/ui/Textarea";

describe("Textarea", () => {
  it("renders with placeholder", () => {
    render(<Textarea placeholder="Enter message" />);
    expect(screen.getByPlaceholderText("Enter message")).toBeInTheDocument();
  });

  it("calls onChange when value changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Textarea onChange={onChange} />);
    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "hello");
    expect(onChange).toHaveBeenCalled();
  });

  it("is disabled when disabled prop is true", () => {
    render(<Textarea disabled placeholder="test" />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("displays value when controlled", () => {
    render(<Textarea value="controlled value" readOnly />);
    expect(screen.getByRole("textbox")).toHaveValue("controlled value");
  });
});
