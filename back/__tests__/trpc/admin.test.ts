import { describe, it, expect, vi, beforeEach } from "vitest";
import { createCaller, createProtectedContext } from "./helpers/caller";

// Mock Prisma
vi.mock("@/lib/common/prisma", () => ({
  prisma: {
    user_report: {
      count: vi.fn(),
    },
    mentor_feedback: {
      count: vi.fn(),
    },
    support_request: {
      count: vi.fn(),
    },
    user: {
      count: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/common/prisma";

describe("Admin Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getStats", () => {
    it("returns aggregated stats for admin", async () => {
      (prisma.user.findUnique as any).mockResolvedValue({ id: "admin-1", role: "ADMIN", status: "ACTIVE" });
      (prisma.user_report.count as any).mockResolvedValue(5);
      (prisma.mentor_feedback.count as any).mockResolvedValue(3);
      (prisma.support_request.count as any).mockResolvedValue(10);
      (prisma.user.count as any).mockResolvedValue(2);

      const ctx = createProtectedContext({ userId: "admin-1" });
      const caller = createCaller(ctx);

      const result = await caller.admin.getStats();

      expect(result).toEqual({
        reports: 5,
        moderation: 3,
        support: 10,
        onboarding: 2,
      });
    });
  });

  describe("getOnboardingQueue", () => {
    it("returns pending users with pagination", async () => {
      (prisma.user.findUnique as any).mockResolvedValue({ id: "admin-1", role: "ADMIN", status: "ACTIVE" });
      const mockUsers = [
        { id: "u1", name: "User 1" },
        { id: "u2", name: "User 2" },
      ];
      (prisma.user.findMany as any).mockResolvedValue(mockUsers);

      const ctx = createProtectedContext({ userId: "admin-1" });
      const caller = createCaller(ctx);

      const result = await caller.admin.getOnboardingQueue({ limit: 10 });

      expect(result.items).toHaveLength(2);
      expect(prisma.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { status: "PENDING" },
        take: 11
      }));
    });
  });
});
