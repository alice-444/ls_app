import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BackButton } from "@/components/shared/back-button";

vi.mock("next/link", () => {
  const React = require("react");
  return {
    default: ({
      children,
      href,
    }: {
      children: React.ReactNode;
      href: string;
    }) => React.createElement("a", { href }, children),
  };
});

describe("BackButton", () => {
  it("renders with default label", () => {
    render(<BackButton />);
    expect(screen.getByRole("button", { name: /retour/i })).toBeInTheDocument();
  });

  it("renders with custom label", () => {
    render(<BackButton label="Retour à la liste" />);
    expect(
      screen.getByRole("button", { name: /retour à la liste/i })
    ).toBeInTheDocument();
  });

  it("renders as link when href is provided", () => {
    render(<BackButton href="/workshops" />);
    const link = screen.getByRole("link", { name: /retour/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/workshops");
  });

  it("calls onClick when clicked and no href", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<BackButton onClick={onClick} />);
    await user.click(screen.getByRole("button", { name: /retour/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders button content with label visible", () => {
    render(<BackButton label="Back" />);
    expect(screen.getByText("Back")).toBeInTheDocument();
  });
});
