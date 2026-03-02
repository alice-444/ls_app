import { describe, it, expect } from "vitest";
import { TRPCError } from "@trpc/server";
import { createCaller, createPublicContext, createProtectedContext } from "./helpers/caller";

describe("trpc privateData", () => {
  it("throws UNAUTHORIZED when session is null", async () => {
    const ctx = createPublicContext();
    const caller = createCaller(ctx);
    await expect(caller.privateData()).rejects.toThrow(TRPCError);
    await expect(caller.privateData()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  });

  it("returns private message and user when authenticated", async () => {
    const ctx = createProtectedContext({ userId: "user-1", name: "Alice" });
    const caller = createCaller(ctx);
    const result = await caller.privateData();
    expect(result).toEqual({
      message: "This is private",
      user: expect.objectContaining({
        id: "user-1",
        name: "Alice",
        email: "test@example.com",
      }),
    });
  });
});
