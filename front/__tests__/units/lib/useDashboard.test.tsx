import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/types/trpc-router";
import { useDashboard } from "@/hooks/useDashboard";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: () => ({
      data: { user: { id: "user-1" } },
      isPending: false,
    }),
  },
}));

vi.mock("@/lib/api-client", () => ({
  getUserRole: vi.fn().mockResolvedValue("APPRENANT"),
}));

const trpc = createTRPCReact<AppRouter>();
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
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

describe("useDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it("returns router, session, and user role", async () => {
    const { result } = renderHook(() => useDashboard(), { wrapper });
    expect(result.current.router).toBeDefined();
    expect(result.current.session).toEqual({ user: { id: "user-1" } });
    expect(typeof result.current.isPending).toBe("boolean");
    expect(["apprenant", "mentor", "both"]).toContain(result.current.userRole);
  });

  it("returns apprentice and mentor data keys", () => {
    const { result } = renderHook(() => useDashboard(), { wrapper });
    expect("workshopRequests" in result.current).toBe(true);
    expect("confirmedWorkshops" in result.current).toBe(true);
    expect("creditBalance" in result.current).toBe(true);
    expect("showCancelDialog" in result.current).toBe(true);
    expect("setShowCancelDialog" in result.current).toBe(true);
    expect("mentorStats" in result.current).toBe(true);
    expect("showFeedbackDialog" in result.current).toBe(true);
  });

  it("setShowCancelDialog updates state", () => {
    const { result } = renderHook(() => useDashboard(), { wrapper });
    expect(result.current.showCancelDialog).toBeNull();
    act(() => {
      result.current.setShowCancelDialog("workshop-123");
    });
    expect(result.current.showCancelDialog).toBe("workshop-123");
  });
});
