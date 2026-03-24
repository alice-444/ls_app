import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FAQAccordion } from "@/components/domains/faq/FAQAccordion";

const mockItems = [
  { id: "1", question: "Question one?", answer: "Answer one." },
  { id: "2", question: "Question two?", answer: "Answer two." },
];

describe("FAQAccordion", () => {
  it("renders all questions", () => {
    render(<FAQAccordion items={mockItems} />);
    expect(screen.getByText("Question one?")).toBeInTheDocument();
    expect(screen.getByText("Question two?")).toBeInTheDocument();
  });

  it("shows answer when question is clicked (exclusive)", async () => {
    const user = userEvent.setup();
    render(<FAQAccordion items={mockItems} exclusive />);
    const trigger1 = screen.getByRole("button", { name: /question one\?/i });
    const trigger2 = screen.getByRole("button", { name: /question two\?/i });
    await user.click(trigger1);
    expect(trigger1).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Answer one.")).toBeInTheDocument();

    await user.click(trigger2);
    expect(trigger1).toHaveAttribute("aria-expanded", "false");
    expect(trigger2).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Answer two.")).toBeInTheDocument();
  });

  it("toggles same item on second click", async () => {
    const user = userEvent.setup();
    render(<FAQAccordion items={mockItems} />);
    const trigger = screen.getByRole("button", { name: /question one\?/i });
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("has aria-expanded on trigger", async () => {
    const user = userEvent.setup();
    render(<FAQAccordion items={mockItems} />);
    const trigger = screen.getByRole("button", { name: /question one\?/i });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("when exclusive is false, multiple items can be open", async () => {
    const user = userEvent.setup();
    render(<FAQAccordion items={mockItems} exclusive={false} />);
    await user.click(screen.getByText("Question one?"));
    await user.click(screen.getByText("Question two?"));
    expect(screen.getByText("Answer one.")).toBeVisible();
    expect(screen.getByText("Answer two.")).toBeVisible();
  });
});
