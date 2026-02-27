import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Submit</Button>);
    await user.click(screen.getByRole("button", { name: /submit/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button", { name: /disabled/i })).toBeDisabled();
  });

  it("applies type submit by default when inside form context", () => {
    render(<Button type="submit">Send</Button>);
    expect(screen.getByRole("button", { name: /send/i })).toHaveAttribute(
      "type",
      "submit"
    );
  });

  it("has data-slot for styling", () => {
    render(<Button>Slot</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-slot", "button");
  });
});
