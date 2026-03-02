import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/types/trpc-router";
import { MentorFeedbacks } from "@/components/mentor/MentorFeedbacks";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: () => ({ data: { user: { id: "user-1" } } }),
  },
}));

const trpc = createTRPCReact<AppRouter>();
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});
const getClient = () =>
  trpc.createClient({
    links: [
      httpBatchLink({
        url: "http://localhost:3000/api/trpc",
        fetch: () => Promise.resolve({ ok: true, json: () => ({}) } as Response),
      }),
    ],
  });

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <trpc.Provider client={getClient()} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}

describe("MentorFeedbacks", () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it("renders loading state when enabled", () => {
    render(
      <MentorFeedbacks mentorId="mentor-1" />,
      { wrapper }
    );
    expect(screen.getByText("Commentaires et notes")).toBeInTheDocument();
    expect(screen.getByText(/chargement/i)).toBeInTheDocument();
  });

  it("renders card title", () => {
    render(
      <MentorFeedbacks mentorId="mentor-1" />,
      { wrapper }
    );
    expect(screen.getByText("Commentaires et notes")).toBeInTheDocument();
  });
});
