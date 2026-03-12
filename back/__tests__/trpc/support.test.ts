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
      updateSupportRequestStatus: (requestId: string, status: any, adminId?: string) =>
        mockUpdateStatus(requestId, status, adminId),
      getSupportRequestById: (requestId: string) =>
        mockGetRequestById(requestId),
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
      (prisma.user.findUnique as any).mockResolvedValue({
        id: "user-1",
        role: "USER",
        status: "ACTIVE",
      });
      const ctx = createProtectedContext({ userId: "user-1" });
      const caller = createCaller(ctx);

      await expect(caller.support.getAdminSupportQueue()).rejects.toThrow(
        TRPCError,
      );
      await expect(caller.support.getAdminSupportQueue()).rejects.toMatchObject(
        {
          code: "FORBIDDEN",
        },
      );
    });

    it("returns support requests when user is admin", async () => {
      (prisma.user.findUnique as any).mockResolvedValue({
        id: "admin-1",
        role: "ADMIN",
        status: "ACTIVE",
      });
      const mockRequests = [
        { id: "creq15720000010mscuid1234", subject: "Help", status: "PENDING" },
        { id: "req-2", subject: "Error", status: "IN_PROGRESS" },
      ];
      mockGetAdminSupportQueue.mockResolvedValue(mockRequests);

      const ctx = createProtectedContext({ userId: "admin-1" });
      const caller = createCaller(ctx);

      const result = await caller.support.getAdminSupportQueue({
        status: "PENDING",
      });

      expect(result).toEqual(mockRequests);
      expect(mockGetAdminSupportQueue).toHaveBeenCalledWith(
        expect.objectContaining({ status: "PENDING" }),
      );
    });
  });

  describe("updateStatus", () => {
    it("updates status when user is admin", async () => {
      (prisma.user.findUnique as any).mockResolvedValue({
        id: "admin-1",
        role: "ADMIN",
        status: "ACTIVE",
      });
      mockUpdateStatus.mockResolvedValue({
        id: "creq15720000010mscuid1234",
        status: "RESOLVED",
      });

      const ctx = createProtectedContext({ userId: "admin-1" });
      const caller = createCaller(ctx);

      const result = await caller.support.updateStatus({
        requestId: "creq15720000010mscuid1234",
        status: "RESOLVED",
      });

      expect(result).toEqual({
        id: "creq15720000010mscuid1234",
        status: "RESOLVED",
      });
      expect(mockUpdateStatus).toHaveBeenCalledWith(
        "creq15720000010mscuid1234",
        "RESOLVED",
        "admin-1"
      );
    });

    it("throws FORBIDDEN when user is not admin", async () => {
      (prisma.user.findUnique as any).mockResolvedValue({
        id: "user-1",
        role: "USER",
        status: "ACTIVE",
      });
      const ctx = createProtectedContext({ userId: "user-1" });
      const caller = createCaller(ctx);

      await expect(
        caller.support.updateStatus({
          requestId: "creq15720000010mscuid1234",
          status: "RESOLVED",
        }),
      ).rejects.toThrow(TRPCError);
    });
  });

  describe("getRequestById", () => {
    it("returns request detail when user is admin", async () => {
      (prisma.user.findUnique as any).mockResolvedValue({
        id: "admin-1",
        role: "ADMIN",
        status: "ACTIVE",
      });
      const mockRequest = {
        id: "creq15720000010mscuid1234",
        subject: "Help",
        description: "I need help",
      };
      mockGetRequestById.mockResolvedValue(mockRequest);

      const ctx = createProtectedContext({ userId: "admin-1" });
      const caller = createCaller(ctx);

      const result = await caller.support.getRequestById({
        requestId: "creq15720000010mscuid1234",
      });

      expect(result).toEqual(mockRequest);
      expect(mockGetRequestById).toHaveBeenCalledWith(
        "creq15720000010mscuid1234",
      );
    });
  });
});
