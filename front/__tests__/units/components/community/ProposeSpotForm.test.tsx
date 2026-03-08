import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProposeSpotForm } from "@/components/community/ProposeSpotForm";

// Mock tRPC
const mockProposeMutate = vi.fn();
vi.mock("@/utils/trpc", () => ({
  trpc: {
    community: {
      proposeSpot: {
        useMutation: () => ({
          mutate: mockProposeMutate,
          isPending: false,
        }),
      },
    },
  },
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

function renderForm() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <ProposeSpotForm onSuccess={vi.fn()} />
    </QueryClientProvider>
  );
}

describe("ProposeSpotForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all form fields", () => {
    renderForm();
    expect(screen.getByLabelText(/spot name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByText(/tags/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit recommendation/i })).toBeInTheDocument();
  });

  it("validates form and submits when valid", async () => {
    const user = userEvent.setup();
    renderForm();
    
    await user.type(screen.getByLabelText(/spot name/i), "My Spot");
    await user.type(screen.getByLabelText(/address/i), "123 Street, City");
    await user.type(screen.getByLabelText(/description/i), "A very quiet place to work with good coffee.");
    
    // Select a tag
    await user.click(screen.getByText("Ultra Calme"));
    
    await user.click(screen.getByRole("button", { name: /submit recommendation/i }));
    
    expect(mockProposeMutate).toHaveBeenCalledWith({
      name: "My Spot",
      address: "123 Street, City",
      description: "A very quiet place to work with good coffee.",
      tags: ["Ultra Calme"],
    });
  });

  it("shows error messages for invalid input", async () => {
    const user = userEvent.setup();
    renderForm();
    
    await user.click(screen.getByRole("button", { name: /submit recommendation/i }));
    
    expect(await screen.findByText(/name must be at least 3 characters/i)).toBeInTheDocument();
    expect(await screen.findByText(/description must be at least 10 characters/i)).toBeInTheDocument();
    expect(await screen.findByText(/address must be at least 5 characters/i)).toBeInTheDocument();
    expect(await screen.findByText(/please select at least one tag/i)).toBeInTheDocument();
  });
});
