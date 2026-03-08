import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CommunityPoll } from "@/components/community/CommunityPoll";

// Mock tRPC
const mockMutate = vi.fn();
vi.mock("@/utils/trpc", () => ({
  trpc: {
    community: {
      voteInPoll: {
        useMutation: () => ({
          mutate: mockMutate,
          isPending: false,
        }),
      },
    },
  },
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockPoll = {
  id: "poll-1",
  question: "What's your favorite study spot?",
  options: [
    { id: "opt-1", label: "Library" },
    { id: "opt-2", label: "Cafe" },
  ],
  hasVoted: false,
  totalVotes: 10,
  results: [
    { optionId: "opt-1", count: 6 },
    { optionId: "opt-2", count: 4 },
  ],
};

function renderPoll(poll = mockPoll) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <CommunityPoll poll={poll} onVoteSuccess={vi.fn()} />
    </QueryClientProvider>
  );
}

describe("CommunityPoll", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders question and options when not voted", () => {
    renderPoll();
    expect(screen.getByText(mockPoll.question)).toBeInTheDocument();
    expect(screen.getByText("Library")).toBeInTheDocument();
    expect(screen.getByText("Cafe")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /voter/i })).toBeInTheDocument();
  });

  it("calls mutate when an option is selected and vote button is clicked", async () => {
    const user = userEvent.setup();
    renderPoll();
    
    await user.click(screen.getByText("Library"));
    await user.click(screen.getByRole("button", { name: /voter/i }));
    
    expect(mockMutate).toHaveBeenCalledWith({
      pollId: "poll-1",
      optionId: "opt-1",
    });
  });

  it("renders results when hasVoted is true", () => {
    const votedPoll = { ...mockPoll, hasVoted: true, userOptionId: "opt-1" };
    renderPoll(votedPoll);
    
    expect(screen.getByText("60%")).toBeInTheDocument(); // 6/10
    expect(screen.getByText("40%")).toBeInTheDocument(); // 4/10
    expect(screen.getByText(/10 vote\(s\) au total/i)).toBeInTheDocument();
  });
});
