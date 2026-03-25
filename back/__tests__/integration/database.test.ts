import { describe, it, expect } from "vitest";
import { prisma } from "../../src/lib/common";

describe("Database Integration", () => {
  it("should connect to the database and perform a simple query", async () => {
    // We use Prisma directly as it's our standard way of interacting with the DB
    const result = await prisma.$queryRaw`SELECT NOW()`;
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect((result as any[])[0].now).toBeDefined();
  }, 15000); // 15 seconds timeout

  it("should be able to count users", async () => {
    const count = await prisma.user.count();
    expect(typeof count).toBe("number");
  }, 15000); // 15 seconds timeout
});
