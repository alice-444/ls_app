import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WorkshopCard } from "@/components/workshop/cards/WorkshopCard";

const baseWorkshop = {
  id: "w1",
  title: "Test Workshop",
  date: "2025-03-01",
  time: "14:00",
  duration: 60,
  location: null,
  isVirtual: true,
  apprenticeId: null,
  maxParticipants: 10,
  status: "PUBLISHED",
  averageRating: null,
};

describe("WorkshopCard", () => {
  it("renders workshop title", () => {
    render(<WorkshopCard workshop={baseWorkshop} />);
    expect(screen.getByText("Test Workshop")).toBeInTheDocument();
  });

  it("calls onViewDetails when card content is clicked", async () => {
    const user = userEvent.setup();
    const onViewDetails = vi.fn();
    render(
      <WorkshopCard workshop={baseWorkshop} onViewDetails={onViewDetails} />
    );
    await user.click(screen.getByText("En ligne"));
    expect(onViewDetails).toHaveBeenCalledWith("w1");
  });

  it("does not render dropdown when showDropdown is false", () => {
    render(<WorkshopCard workshop={baseWorkshop} showDropdown={false} />);
    expect(screen.getByText("Test Workshop")).toBeInTheDocument();
    const menuTrigger = screen.queryByRole("button", { name: /more/i });
    expect(menuTrigger).not.toBeInTheDocument();
  });

  it("renders Dupliquer button when variant is past and onDuplicate is provided", () => {
    render(
      <WorkshopCard
        workshop={{ ...baseWorkshop, status: "COMPLETED" }}
        variant="past"
        onDuplicate={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: /dupliquer cet atelier/i })).toBeInTheDocument();
  });

  it("renders average rating when variant is past and workshop has averageRating", () => {
    render(
      <WorkshopCard
        workshop={{ ...baseWorkshop, averageRating: 4.5, status: "COMPLETED" }}
        variant="past"
      />
    );
    expect(screen.getByText("4.5/5")).toBeInTheDocument();
  });
});
