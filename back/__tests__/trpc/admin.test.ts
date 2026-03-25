import { describe, it, expect, vi, beforeEach } from "vitest";
import { createCaller, createProtectedContext } from "./helpers/caller";

// Mock Container and AdminService
vi.mock("@/lib/di/container", () => ({
  container: {
    adminService: {
      getStats: vi.fn(),
      getOnboardingQueue: vi.fn(),
      approveUser: vi.fn(),
      rejectUser: vi.fn(),
      getUser360: vi.fn(),
      updateUserCredits: vi.fn(),
      bulkApproveUsers: vi.fn(),
      bulkRejectUsers: vi.fn(),
    },
    analyticsService: {
      getAnalytics: vi.fn(),
    },
    auditLogService: {
      record: vi.fn().mockResolvedValue(undefined),
    }
  }
}));

// Mock Prisma for the role-check in procedure and direct usage in router
vi.mock("@/lib/common/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

import { container } from "@/lib/di/container";
import { prisma } from "@/lib/common/prisma";

describe("Admin Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getStats", () => {
    it("returns aggregated stats for admin", async () => {
      (prisma.user.findUnique as any).mockResolvedValue({ id: "admin-1", role: "ADMIN", status: "ACTIVE" });
      (container.adminService.getStats as any).mockResolvedValue({
        reports: 5,
        moderation: 3,
        support: 10,
        onboarding: 2,
      });

      const ctx = createProtectedContext({ userId: "admin-1" });
      const caller = createCaller(ctx);

      const result = await caller.admin.getStats();

      expect(result).toEqual({
        reports: 5,
        moderation: 3,
        support: 10,
        onboarding: 2,
      });
      expect(container.adminService.getStats).toHaveBeenCalled();
    });
  });

  describe("getOnboardingQueue", () => {
    it("returns pending users with pagination", async () => {
      (prisma.user.findUnique as any).mockResolvedValue({ id: "cliz1234567890abcdefghijkl", role: "ADMIN", status: "ACTIVE" });
      const mockUsers = [
        { id: "clizuser1234567890abcdefgh", name: "User 1" },
        { id: "clizuser234567890abcdefgi", name: "User 2" },
      ];
      (prisma.user.findMany as any).mockResolvedValue(mockUsers);

      const ctx = createProtectedContext({ userId: "cliz1234567890abcdefghijkl" });
      const caller = createCaller(ctx);

      const result = await caller.admin.getOnboardingQueue({ limit: 10 });

      expect(result.items).toHaveLength(2);
      expect(prisma.user.findMany).toHaveBeenCalled();
    });
  });

  describe("bulkApproveUsers", () => {
    it("approves multiple users", async () => {
      (prisma.user.findUnique as any).mockResolvedValue({ id: "cliz1234567890abcdefghijkl", role: "ADMIN", status: "ACTIVE" });
      (container.adminService.bulkApproveUsers as any).mockResolvedValue({ count: 2 });

      const ctx = createProtectedContext({ userId: "cliz1234567890abcdefghijkl" });
      const caller = createCaller(ctx);

      const result = await caller.admin.bulkApproveUsers({ userIds: ["clizuser1", "clizuser2"] });

      expect(result).toEqual({ count: 2 });
      expect(container.adminService.bulkApproveUsers).toHaveBeenCalledWith(["clizuser1", "clizuser2"], "cliz1234567890abcdefghijkl");
    });
  });

  describe("updateUserCredits", () => {
    it("updates credits for a user", async () => {
      (prisma.user.findUnique as any).mockResolvedValue({ id: "cliz1234567890abcdefghijkl", role: "ADMIN", status: "ACTIVE" });
      (container.adminService.updateUserCredits as any).mockResolvedValue({ id: "clizuser1", creditBalance: 100 });

      const ctx = createProtectedContext({ userId: "cliz1234567890abcdefghijkl" });
      const caller = createCaller(ctx);

      const result = await caller.admin.updateUserCredits({ 
        userId: "clizuser1234567890abcdefgh", 
        amount: 50, 
        reason: "Test", 
        type: "ADD" 
      });

      expect(result.creditBalance).toBe(100);
      expect(container.adminService.updateUserCredits).toHaveBeenCalledWith({
        adminId: "cliz1234567890abcdefghijkl",
        userId: "clizuser1234567890abcdefgh",
        amount: 50,
        reason: "Test",
        type: "ADD"
      });
    });
  });

  describe("getUser360", () => {
    it("returns comprehensive user profile", async () => {
      (prisma.user.findUnique as any).mockResolvedValue({ id: "cliz1234567890abcdefghijkl", role: "ADMIN", status: "ACTIVE" });
      const mockUser360 = { id: "clizuser1", name: "User 1", workshops_as_mentor: [], auditLogs: [] };
      (container.adminService.getUser360 as any).mockResolvedValue(mockUser360);

      const ctx = createProtectedContext({ userId: "cliz1234567890abcdefghijkl" });
      const caller = createCaller(ctx);

      const result = await caller.admin.getUser360({ userId: "clizuser1234567890abcdefgh" });

      expect(result.id).toBe("clizuser1");
      expect(container.adminService.getUser360).toHaveBeenCalledWith("clizuser1234567890abcdefgh");
    });
  });
});
