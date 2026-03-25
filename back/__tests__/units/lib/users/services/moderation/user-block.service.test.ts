import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../../../../../../src/lib/common/prisma", () => ({ prisma: {} }));
vi.mock("../../../../../../src/lib/common/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { UserBlockService } from "../../../../../../src/lib/users/services/moderation/user-block.service";

describe("UserBlockService", () => {
  const mockBlockRepo = {
    findBlock: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    isBlocked: vi.fn(),
    findBlocksByBlocker: vi.fn(),
    findBlocksByBlocked: vi.fn(),
  };

  const mockAppUserRepo = {
    findByUserId: vi.fn(),
    findByAppUserId: vi.fn(),
    findUserNameByUserId: vi.fn(),
    findIdentityCardByUserId: vi.fn(),
  };

  const mockAuditLog = {
    record: vi.fn(),
  };

  let service: UserBlockService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new UserBlockService(
      mockBlockRepo as any,
      mockAppUserRepo as any,
      mockAuditLog as any,
      1
    );
  });

  afterEach(() => {
    (service as any).cache.destroy();
  });

  describe("blockUser", () => {
    it("returns failure when blocking self", async () => {
      const result = await service.blockUser("user-1", "user-1");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain("yourself");
        expect(result.status).toBe(400);
      }
    });

    it("returns failure when blocker not found", async () => {
      mockAppUserRepo.findByUserId.mockResolvedValue(null);

      const result = await service.blockUser("user-1", "user-2");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(404);
    });

    it("returns failure when blocked user not found", async () => {
      mockAppUserRepo.findByUserId
        .mockResolvedValueOnce({ id: "app-1" })
        .mockResolvedValueOnce(null);

      const result = await service.blockUser("user-1", "user-2");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(404);
    });

    it("returns success (idempotent) when already blocked", async () => {
      mockAppUserRepo.findByUserId
        .mockResolvedValueOnce({ id: "app-1" })
        .mockResolvedValueOnce({ id: "app-2" });
      mockBlockRepo.findBlock.mockResolvedValue({ id: "block-1" });

      const result = await service.blockUser("user-1", "user-2");
      expect(result.ok).toBe(true);
      expect(mockBlockRepo.create).not.toHaveBeenCalled();
    });

    it("creates block and records audit on success", async () => {
      mockAppUserRepo.findByUserId
        .mockResolvedValueOnce({ id: "app-1" })
        .mockResolvedValueOnce({ id: "app-2" });
      mockBlockRepo.findBlock.mockResolvedValue(null);
      mockBlockRepo.create.mockResolvedValue({ id: "block-new" });
      mockAuditLog.record.mockResolvedValue({});

      const result = await service.blockUser("user-1", "user-2");
      expect(result.ok).toBe(true);
      expect(mockBlockRepo.create).toHaveBeenCalledWith("app-1", "app-2");
      expect(mockAuditLog.record).toHaveBeenCalledWith({
        adminId: "user-1",
        action: "USER_BLOCKED",
        targetId: "user-2",
        details: expect.objectContaining({ blockId: "block-new" })
      });
    });
  });

  describe("unblockUser", () => {
    it("returns failure when blocking self", async () => {
      const result = await service.unblockUser("user-1", "user-1");
      expect(result.ok).toBe(false);
    });

    it("succeeds and records audit", async () => {
      mockAppUserRepo.findByUserId
        .mockResolvedValueOnce({ id: "app-1" })
        .mockResolvedValueOnce({ id: "app-2" });
      mockBlockRepo.delete.mockResolvedValue({});
      mockAuditLog.record.mockResolvedValue({});

      const result = await service.unblockUser("user-1", "user-2");
      expect(result.ok).toBe(true);
      expect(mockBlockRepo.delete).toHaveBeenCalledWith("app-1", "app-2");
      expect(mockAuditLog.record).toHaveBeenCalledWith({
        adminId: "user-1",
        action: "USER_UNBLOCKED",
        targetId: "user-2",
        details: expect.any(Object)
      });
    });
  });

  describe("checkIfBlocked", () => {
    it("returns cached value when available", async () => {
      (service as any).cache.set("user-1", "user-2", true);

      const result = await service.checkIfBlocked("user-1", "user-2");
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.data).toBe(true);
      expect(mockAppUserRepo.findByUserId).not.toHaveBeenCalled();
    });

    it("falls back to repository when not cached", async () => {
      mockAppUserRepo.findByUserId
        .mockResolvedValueOnce({ id: "app-1" })
        .mockResolvedValueOnce({ id: "app-2" });
      mockBlockRepo.isBlocked.mockResolvedValue(false);

      const result = await service.checkIfBlocked("user-1", "user-2");
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.data).toBe(false);
      expect(mockBlockRepo.isBlocked).toHaveBeenCalledWith("app-1", "app-2");
    });

    it("caches the result after repo lookup", async () => {
      mockAppUserRepo.findByUserId
        .mockResolvedValueOnce({ id: "app-1" })
        .mockResolvedValueOnce({ id: "app-2" });
      mockBlockRepo.isBlocked.mockResolvedValue(true);

      await service.checkIfBlocked("user-1", "user-2");

      vi.clearAllMocks();
      const result = await service.checkIfBlocked("user-1", "user-2");
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.data).toBe(true);
      expect(mockAppUserRepo.findByUserId).not.toHaveBeenCalled();
    });
  });

  describe("isUserBlocked", () => {
    it("wraps checkIfBlocked result", async () => {
      mockAppUserRepo.findByUserId
        .mockResolvedValueOnce({ id: "app-1" })
        .mockResolvedValueOnce({ id: "app-2" });
      mockBlockRepo.isBlocked.mockResolvedValue(true);

      const result = await service.isUserBlocked("user-1", "user-2");
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.data.isBlocked).toBe(true);
    });
  });

  describe("areUsersBlocked", () => {
    it("checks both directions", async () => {
      mockAppUserRepo.findByUserId.mockImplementation((id: string) => {
        if (id === "user-1") return Promise.resolve({ id: "app-1" });
        if (id === "user-2") return Promise.resolve({ id: "app-2" });
        return Promise.resolve(null);
      });
      mockBlockRepo.isBlocked.mockImplementation(
        (blockerId: string, blockedId: string) => {
          if (blockerId === "app-1" && blockedId === "app-2")
            return Promise.resolve(true);
          return Promise.resolve(false);
        }
      );

      const result = await service.areUsersBlocked("user-1", "user-2");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.user1BlockedUser2).toBe(true);
        expect(result.data.user2BlockedUser1).toBe(false);
      }
    });
  });
});
