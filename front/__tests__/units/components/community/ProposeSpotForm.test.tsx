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
    expect(screen.getByLabelText(/nom du spot/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/adresse/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByText(/tags/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /envoyer la recommandation/i })).toBeInTheDocument();
  });

  it("validates form and submits when valid", async () => {
    const user = userEvent.setup();
    renderForm();
    
    await user.type(screen.getByLabelText(/nom du spot/i), "My Spot");
    await user.type(screen.getByLabelText(/adresse/i), "123 Street, City");
    await user.type(screen.getByLabelText(/description/i), "A very quiet place to work with good coffee.");
    
    // Select a tag
    await user.click(screen.getByText("Ultra Calme"));
    
    await user.click(screen.getByRole("button", { name: /envoyer la recommandation/i }));
    
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
    
    await user.click(screen.getByRole("button", { name: /envoyer la recommandation/i }));
    
    expect(await screen.findByText(/le nom doit faire au moins 3 caractères/i)).toBeInTheDocument();
    expect(await screen.findByText(/la description doit faire au moins 10 caractères/i)).toBeInTheDocument();
    expect(await screen.findByText(/l'adresse doit faire au moins 5 caractères/i)).toBeInTheDocument();
    expect(await screen.findByText(/choisis au moins un tag/i)).toBeInTheDocument();
  });
});
