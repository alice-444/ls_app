import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/types/trpc-router";
import { useMyWorkshops } from "@/hooks/useMyWorkshops";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/auth-server-client", () => ({
  authClient: {
    useSession: () => ({
      data: { user: { id: "user-1" } },
      isPending: false,
    }),
  },
}));

vi.mock("@/lib/api-client", () => ({
  API_BASE_URL: "http://localhost:3000",
  getUserRole: vi.fn().mockResolvedValue("MENTOR"),
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

describe("useMyWorkshops", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it("returns router, session, and loading state", async () => {
    const { result } = renderHook(() => useMyWorkshops(), { wrapper });
    expect(result.current.router).toBeDefined();
    expect(result.current.session).toEqual({ user: { id: "user-1" } });
    expect(typeof result.current.isSessionLoading).toBe("boolean");
  });

  it("returns search and filter state", () => {
    const { result } = renderHook(() => useMyWorkshops(), { wrapper });
    expect(result.current.searchQuery).toBe("");
    expect(result.current.sortField).toBe("date");
    expect(result.current.sortOrder).toBe("desc");
    expect(result.current.statusFilter).toBe("all");
    act(() => {
      result.current.setSearchQuery("test");
    });
    expect(result.current.searchQuery).toBe("test");
    act(() => {
      result.current.setStatusFilter("PUBLISHED");
    });
    expect(result.current.statusFilter).toBe("PUBLISHED");
  });

  it("returns dialog and calendar state", () => {
    const { result } = renderHook(() => useMyWorkshops(), { wrapper });
    expect(result.current.showDeleteDialog).toBeNull();
    expect(result.current.calendarView).toBe("month");
    act(() => {
      result.current.setShowDeleteDialog("workshop-1");
    });
    expect(result.current.showDeleteDialog).toBe("workshop-1");
  });

  it("returns handlers", () => {
    const { result } = renderHook(() => useMyWorkshops(), { wrapper });
    expect(typeof result.current.handleAcceptRequest).toBe("function");
    expect(typeof result.current.handleRejectRequest).toBe("function");
    expect(typeof result.current.confirmRejectRequest).toBe("function");
    expect(typeof result.current.handleDelete).toBe("function");
    expect(typeof result.current.handlePublish).toBe("function");
    expect(typeof result.current.handleUnpublish).toBe("function");
  });
});
