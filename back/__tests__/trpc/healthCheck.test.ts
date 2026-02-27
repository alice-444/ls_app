import { describe, it, expect } from "vitest";
import { createCaller, createPublicContext } from "./helpers/caller";

describe("trpc healthCheck", () => {
  it("returns OK for public caller", async () => {
    const ctx = createPublicContext();
    const caller = createCaller(ctx);
    const result = await caller.healthCheck();
    expect(result).toBe("OK");
  });
});
