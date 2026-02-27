import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@/components/ui/input";

describe("Input", () => {
  it("renders with placeholder", () => {
    render(<Input placeholder="Enter email" />);
    expect(screen.getByPlaceholderText("Enter email")).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    render(<Input placeholder="test" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("data-slot", "input");
  });

  it("calls onChange when value changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input onChange={onChange} />);
    await user.type(screen.getByRole("textbox"), "a");
    expect(onChange).toHaveBeenCalled();
  });

  it("is disabled when disabled prop is true", () => {
    render(<Input disabled placeholder="test" />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("supports type email", () => {
    render(<Input type="email" placeholder="email" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "email");
  });
});
