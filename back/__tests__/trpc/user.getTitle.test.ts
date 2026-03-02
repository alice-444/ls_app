import { describe, it, expect, vi, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";
import { createCaller, createPublicContext, createProtectedContext } from "./helpers/caller";

const mockFindUnique = vi.fn();
const mockGetBalance = vi.fn();

vi.mock("@/lib/di/container", () => ({
  container: {
    prisma: {
      user: { findUnique: (args: unknown) => mockFindUnique(args) },
    },
    creditService: {
      getBalance: (userId: string) => mockGetBalance(userId),
    },
  },
}));

describe("trpc user.getTitle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindUnique.mockResolvedValue({ title: "Explorer" });
  });

  it("throws UNAUTHORIZED when not authenticated", async () => {
    const ctx = createPublicContext();
    const caller = createCaller(ctx);
    await expect(caller.user.getTitle()).rejects.toThrow(TRPCError);
    await expect(caller.user.getTitle()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("returns title when authenticated", async () => {
    const ctx = createProtectedContext({ userId: "user-1" });
    const caller = createCaller(ctx);
    const result = await caller.user.getTitle();
    expect(result).toEqual({ title: "Explorer" });
    expect(mockFindUnique).toHaveBeenCalled();
  });
});
