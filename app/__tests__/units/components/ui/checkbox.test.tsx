import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "@/components/ui/checkbox";

describe("Checkbox", () => {
  it("renders", () => {
    const { container } = render(<Checkbox />);
    const checkbox = container.querySelector("[data-slot='checkbox']");
    expect(checkbox).toBeInTheDocument();
  });

  it("is checked when checked prop is true", () => {
    const { container } = render(<Checkbox checked />);
    const checkbox = container.querySelector("button[role='checkbox']");
    expect(checkbox).toHaveAttribute("data-state", "checked");
  });

  it("calls onCheckedChange when clicked", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const { container } = render(<Checkbox onCheckedChange={onCheckedChange} />);
    const checkbox = container.querySelector("button[role='checkbox']");
    if (checkbox) await user.click(checkbox as HTMLElement);
    expect(onCheckedChange).toHaveBeenCalled();
  });

  it("is disabled when disabled prop is true", () => {
    const { container } = render(<Checkbox disabled />);
    const checkbox = container.querySelector("button[role='checkbox']");
    expect(checkbox).toBeDisabled();
  });
});
