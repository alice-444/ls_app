import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

describe("Dialog", () => {
  it("returns null when open is false", () => {
    const { container } = render(
      <Dialog open={false} onOpenChange={vi.fn()}>
        <DialogContent>Content</DialogContent>
      </Dialog>
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders overlay and children when open is true", () => {
    render(
      <Dialog open onOpenChange={vi.fn()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
          </DialogHeader>
          <DialogFooter>Footer</DialogFooter>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("calls onOpenChange(false) when overlay is clicked", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Dialog open onOpenChange={onOpenChange}>
        <DialogContent>
          <span>Content</span>
        </DialogContent>
      </Dialog>
    );
    const overlay = document.querySelector(".bg-black\\/80");
    if (overlay) await user.click(overlay as HTMLElement);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("DialogContent with onClose renders close button and calls onClose when clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Dialog open onOpenChange={vi.fn()}>
        <DialogContent onClose={onClose}>
          <span>Content</span>
        </DialogContent>
      </Dialog>
    );
    const closeButton = screen.getByRole("button", { name: /close/i });
    await user.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
