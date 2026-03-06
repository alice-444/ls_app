import { describe, it, expect, vi, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";
import { createCaller, createProtectedContext } from "./helpers/caller";

const mockGetAdminSupportQueue = vi.fn();
const mockUpdateStatus = vi.fn();
const mockGetRequestById = vi.fn();

vi.mock("@/lib/di/container", () => ({
  container: {
    supportRequestService: {
      getAdminSupportQueue: (params: any) => mockGetAdminSupportQueue(params),
      updateSupportRequestStatus: (requestId: string, status: any) => mockUpdateStatus(requestId, status),
      getSupportRequestById: (requestId: string) => mockGetRequestById(requestId),
    },
    auditLogService: {
      record: vi.fn(),
    },
  },
}));

vi.mock("@/lib/common/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/common/prisma";

describe("Support Router TRPC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAdminSupportQueue", () => {
    it("throws FORBIDDEN when user is not admin", async () => {
      (prisma.user.findUnique as any).mockResolvedValue({ id: "user-1", role: "USER", status: "ACTIVE" });
      const ctx = createProtectedContext({ userId: "user-1" });
      const caller = createCaller(ctx);
      
      await expect(caller.support.getAdminSupportQueue()).rejects.toThrow(TRPCError);
      await expect(caller.support.getAdminSupportQueue()).rejects.toMatchObject({
        code: "FORBIDDEN",
      });
    });

    it("returns support requests when user is admin", async () => {
      (prisma.user.findUnique as any).mockResolvedValue({ id: "admin-1", role: "ADMIN", status: "ACTIVE" });
      const mockRequests = [
        { id: "req-1", subject: "Help", status: "PENDING" },
        { id: "req-2", subject: "Error", status: "IN_PROGRESS" },
      ];
      mockGetAdminSupportQueue.mockResolvedValue(mockRequests);
      
      const ctx = createProtectedContext({ userId: "admin-1" });
      const caller = createCaller(ctx);
      
      const result = await caller.support.getAdminSupportQueue({ status: "PENDING" });
      
      expect(result).toEqual(mockRequests);
      expect(mockGetAdminSupportQueue).toHaveBeenCalledWith(expect.objectContaining({ status: "PENDING" }));
    });
  });

  describe("updateStatus", () => {
    it("updates status when user is admin", async () => {
      (prisma.user.findUnique as any).mockResolvedValue({ id: "admin-1", role: "ADMIN", status: "ACTIVE" });
      mockUpdateStatus.mockResolvedValue({ id: "req-1", status: "RESOLVED" });
      
      const ctx = createProtectedContext({ userId: "admin-1" });
      const caller = createCaller(ctx);
      
      const result = await caller.support.updateStatus({ requestId: "req-1", status: "RESOLVED" });
      
      expect(result).toEqual({ id: "req-1", status: "RESOLVED" });
      expect(mockUpdateStatus).toHaveBeenCalledWith("req-1", "RESOLVED");
    });

    it("throws FORBIDDEN when user is not admin", async () => {
      (prisma.user.findUnique as any).mockResolvedValue({ id: "user-1", role: "USER", status: "ACTIVE" });
      const ctx = createProtectedContext({ userId: "user-1" });
      const caller = createCaller(ctx);
      
      await expect(caller.support.updateStatus({ requestId: "req-1", status: "RESOLVED" })).rejects.toThrow(TRPCError);
    });
  });

  describe("getRequestById", () => {
    it("returns request detail when user is admin", async () => {
      (prisma.user.findUnique as any).mockResolvedValue({ id: "admin-1", role: "ADMIN", status: "ACTIVE" });
      const mockRequest = { id: "req-1", subject: "Help", description: "I need help" };
      mockGetRequestById.mockResolvedValue(mockRequest);
      
      const ctx = createProtectedContext({ userId: "admin-1" });
      const caller = createCaller(ctx);
      
      const result = await caller.support.getRequestById({ requestId: "req-1" });
      
      expect(result).toEqual(mockRequest);
      expect(mockGetRequestById).toHaveBeenCalledWith("req-1");
    });
  });
});
