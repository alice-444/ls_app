import { describe, it, expect, vi, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";
import { createCaller, createPublicContext, createProtectedContext } from "./helpers/caller";

const mockGetBalance = vi.fn();

vi.mock("@/lib/di/container", () => ({
  container: {
    creditService: {
      getBalance: (userId: string) => mockGetBalance(userId),
    },
  },
}));

describe("trpc credits.getBalance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetBalance.mockResolvedValue({ ok: true, data: { balance: 10 } });
  });

  it("throws UNAUTHORIZED when not authenticated", async () => {
    const ctx = createPublicContext();
    const caller = createCaller(ctx);
    await expect(caller.credits.getBalance()).rejects.toThrow(TRPCError);
    await expect(caller.credits.getBalance()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
    expect(mockGetBalance).not.toHaveBeenCalled();
  });

  it("returns balance when authenticated", async () => {
    const ctx = createProtectedContext({ userId: "user-1" });
    const caller = createCaller(ctx);
    const result = await caller.credits.getBalance();
    expect(result).toEqual({ balance: 10 });
    expect(mockGetBalance).toHaveBeenCalledWith("user-1");
  });
});
