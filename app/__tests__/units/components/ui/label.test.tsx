import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Label } from "@/components/ui/label";

describe("Label", () => {
  it("renders children", () => {
    render(<Label>Email</Label>);
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("associates with input via htmlFor", () => {
    render(
      <>
        <Label htmlFor="email-id">Email</Label>
        <input id="email-id" />
      </>
    );
    const label = screen.getByText("Email");
    expect(label).toHaveAttribute("for", "email-id");
  });

  it("has data-slot", () => {
    render(<Label>Test</Label>);
    expect(screen.getByText("Test")).toHaveAttribute("data-slot", "label");
  });
});
