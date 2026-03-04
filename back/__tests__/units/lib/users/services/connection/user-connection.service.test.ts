import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../../../../src/lib/common/prisma", () => ({ prisma: {} }));
vi.mock("../../../../../../src/lib/common/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));
vi.mock("../../../../../../src/lib/auth/services/user-helpers", () => ({
  verifyUserExists: vi.fn(),
}));
vi.mock("../../../../../../src/lib/utils/id-generator", () => ({
  generateInternalId: vi.fn().mockReturnValue("generated-id"),
}));

import { UserConnectionService } from "../../../../../../src/lib/users/services/connection/user-connection.service";
import { verifyUserExists } from "../../../../../../src/lib/auth/services/user-helpers";

const mockVerifyUserExists = vi.mocked(verifyUserExists);

describe("UserConnectionService", () => {
  const mockAppUserRepo = {
    findByUserId: vi.fn(),
    findByAppUserId: vi.fn(),
    findUserNameByUserId: vi.fn(),
    findIdentityCardByUserId: vi.fn(),
  };

  const mockConnectionRepo = {
    findConnectionBetweenUsers: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findPendingRequestsReceivedBy: vi.fn(),
    findAcceptedConnectionsFor: vi.fn(),
    findPendingRequestsSentBy: vi.fn(),
  };

  const mockUserBlockService = {
    areUsersBlocked: vi.fn().mockResolvedValue({
      ok: true,
      data: { user1BlockedUser2: false, user2BlockedUser1: false },
    }),
    getAllBlockedAppUserIds: vi.fn().mockResolvedValue({
      ok: true,
      data: { blockedByUser: [], blockedUser: [] },
    }),
  };

  const mockNotificationService = {
    createNotification: vi.fn().mockResolvedValue({ ok: true }),
  };

  let service: UserConnectionService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new UserConnectionService(
      mockAppUserRepo as any,
      mockConnectionRepo as any,
      mockUserBlockService as any,
      mockNotificationService as any
    );
  });

  describe("sendConnectionRequest", () => {
    it("returns 400 when sending request to yourself", async () => {
      const result = await service.sendConnectionRequest("user-1", "user-1");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(400);
    });

    it("returns failure when requester does not exist", async () => {
      mockVerifyUserExists.mockResolvedValue({
        ok: false,
        error: "User not found",
        status: 404,
      });

      const result = await service.sendConnectionRequest("user-1", "user-2");
      expect(result.ok).toBe(false);
    });

    it("returns failure when receiver does not exist", async () => {
      mockVerifyUserExists
        .mockResolvedValueOnce({ ok: true, data: { user: { id: "user-1" } } })
        .mockResolvedValueOnce({ ok: false, error: "User not found", status: 404 });

      const result = await service.sendConnectionRequest("user-1", "user-2");
      expect(result.ok).toBe(false);
    });

    it("returns 404 when one or both appUsers not found", async () => {
      mockVerifyUserExists.mockResolvedValue({ ok: true, data: { user: { id: "u" } } });
      mockAppUserRepo.findByUserId
        .mockResolvedValueOnce({ id: "app-1" })
        .mockResolvedValueOnce(null);

      const result = await service.sendConnectionRequest("user-1", "user-2");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(404);
    });

    it("returns 400 when users are already connected", async () => {
      mockVerifyUserExists.mockResolvedValue({ ok: true, data: { user: { id: "u" } } });
      mockAppUserRepo.findByUserId
        .mockResolvedValueOnce({ id: "app-1" })
        .mockResolvedValueOnce({ id: "app-2" });
      mockConnectionRepo.findConnectionBetweenUsers.mockResolvedValue({
        status: "ACCEPTED",
      });

      const result = await service.sendConnectionRequest("user-1", "user-2");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(400);
    });

    it("returns 400 when request is already pending", async () => {
      mockVerifyUserExists.mockResolvedValue({ ok: true, data: { user: { id: "u" } } });
      mockAppUserRepo.findByUserId
        .mockResolvedValueOnce({ id: "app-1" })
        .mockResolvedValueOnce({ id: "app-2" });
      mockConnectionRepo.findConnectionBetweenUsers.mockResolvedValue({
        status: "PENDING",
      });

      const result = await service.sendConnectionRequest("user-1", "user-2");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(400);
    });

    it("creates connection request successfully", async () => {
      mockVerifyUserExists.mockResolvedValue({ ok: true, data: { user: { id: "u" } } });
      mockAppUserRepo.findByUserId
        .mockResolvedValueOnce({ id: "app-1" })
        .mockResolvedValueOnce({ id: "app-2" });
      mockConnectionRepo.findConnectionBetweenUsers.mockResolvedValue(null);
      mockConnectionRepo.create.mockResolvedValue({});

      const result = await service.sendConnectionRequest("user-1", "user-2");
      expect(result.ok).toBe(true);
      expect(mockConnectionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          requesterId: "app-1",
          receiverId: "app-2",
          status: "PENDING",
        })
      );
    });
  });

  describe("acceptConnectionRequest", () => {
    it("returns failure when user does not exist", async () => {
      mockVerifyUserExists.mockResolvedValue({
        ok: false,
        error: "User not found",
        status: 404,
      });

      const result = await service.acceptConnectionRequest("user-1", "conn-1");
      expect(result.ok).toBe(false);
    });

    it("returns 404 when appUser not found", async () => {
      mockVerifyUserExists.mockResolvedValue({ ok: true, data: { user: { id: "u" } } });
      mockAppUserRepo.findByUserId.mockResolvedValue(null);

      const result = await service.acceptConnectionRequest("user-1", "conn-1");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(404);
    });

    it("returns 404 when connection not found", async () => {
      mockVerifyUserExists.mockResolvedValue({ ok: true, data: { user: { id: "u" } } });
      mockAppUserRepo.findByUserId.mockResolvedValue({ id: "app-1" });
      mockConnectionRepo.findById.mockResolvedValue(null);

      const result = await service.acceptConnectionRequest("user-1", "conn-1");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(404);
    });

    it("returns 403 when user is not the receiver", async () => {
      mockVerifyUserExists.mockResolvedValue({ ok: true, data: { user: { id: "u" } } });
      mockAppUserRepo.findByUserId.mockResolvedValue({ id: "app-1" });
      mockConnectionRepo.findById.mockResolvedValue({
        receiverId: "other-app",
        status: "PENDING",
      });

      const result = await service.acceptConnectionRequest("user-1", "conn-1");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(403);
    });

    it("returns 400 when connection is not pending", async () => {
      mockVerifyUserExists.mockResolvedValue({ ok: true, data: { user: { id: "u" } } });
      mockAppUserRepo.findByUserId.mockResolvedValue({ id: "app-1" });
      mockConnectionRepo.findById.mockResolvedValue({
        receiverId: "app-1",
        status: "ACCEPTED",
      });

      const result = await service.acceptConnectionRequest("user-1", "conn-1");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(400);
    });

    it("accepts connection successfully", async () => {
      mockVerifyUserExists.mockResolvedValue({ ok: true, data: { user: { id: "u" } } });
      mockAppUserRepo.findByUserId.mockResolvedValue({ id: "app-1" });
      mockConnectionRepo.findById.mockResolvedValue({
        receiverId: "app-1",
        status: "PENDING",
      });
      mockConnectionRepo.update.mockResolvedValue({});

      const result = await service.acceptConnectionRequest("user-1", "conn-1");
      expect(result.ok).toBe(true);
      expect(mockConnectionRepo.update).toHaveBeenCalledWith("conn-1", {
        status: "ACCEPTED",
        updatedAt: expect.any(Date),
      });
    });
  });

  describe("rejectConnectionRequest", () => {
    it("returns 403 when user is not the receiver", async () => {
      mockVerifyUserExists.mockResolvedValue({ ok: true, data: { user: { id: "u" } } });
      mockAppUserRepo.findByUserId.mockResolvedValue({ id: "app-1" });
      mockConnectionRepo.findById.mockResolvedValue({
        receiverId: "other-app",
        status: "PENDING",
      });

      const result = await service.rejectConnectionRequest("user-1", "conn-1");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(403);
    });

    it("rejects connection successfully", async () => {
      mockVerifyUserExists.mockResolvedValue({ ok: true, data: { user: { id: "u" } } });
      mockAppUserRepo.findByUserId.mockResolvedValue({ id: "app-1" });
      mockConnectionRepo.findById.mockResolvedValue({
        receiverId: "app-1",
        status: "PENDING",
      });
      mockConnectionRepo.update.mockResolvedValue({});

      const result = await service.rejectConnectionRequest("user-1", "conn-1");
      expect(result.ok).toBe(true);
      expect(mockConnectionRepo.update).toHaveBeenCalledWith("conn-1", {
        status: "REJECTED",
        updatedAt: expect.any(Date),
      });
    });
  });

  describe("removeConnection", () => {
    it("returns 404 when one or both users not found", async () => {
      mockVerifyUserExists.mockResolvedValue({ ok: true, data: { user: { id: "u" } } });
      mockAppUserRepo.findByUserId
        .mockResolvedValueOnce({ id: "app-1" })
        .mockResolvedValueOnce(null);

      const result = await service.removeConnection("user-1", "user-2");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(404);
    });

    it("returns 404 when no accepted connection exists", async () => {
      mockVerifyUserExists.mockResolvedValue({ ok: true, data: { user: { id: "u" } } });
      mockAppUserRepo.findByUserId
        .mockResolvedValueOnce({ id: "app-1" })
        .mockResolvedValueOnce({ id: "app-2" });
      mockConnectionRepo.findConnectionBetweenUsers.mockResolvedValue(null);

      const result = await service.removeConnection("user-1", "user-2");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(404);
    });

    it("deletes accepted connection successfully", async () => {
      mockVerifyUserExists.mockResolvedValue({ ok: true, data: { user: { id: "u" } } });
      mockAppUserRepo.findByUserId
        .mockResolvedValueOnce({ id: "app-1" })
        .mockResolvedValueOnce({ id: "app-2" });
      mockConnectionRepo.findConnectionBetweenUsers.mockResolvedValue({
        id: "conn-1",
        status: "ACCEPTED",
      });
      mockConnectionRepo.delete.mockResolvedValue(undefined);

      const result = await service.removeConnection("user-1", "user-2");
      expect(result.ok).toBe(true);
      expect(mockConnectionRepo.delete).toHaveBeenCalledWith("conn-1");
    });
  });

  describe("checkConnectionStatus", () => {
    it("returns 404 when users not found", async () => {
      mockAppUserRepo.findByUserId
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      const result = await service.checkConnectionStatus("user-1", "user-2");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(404);
    });

    it("returns null status when no connection exists", async () => {
      mockAppUserRepo.findByUserId
        .mockResolvedValueOnce({ id: "app-1" })
        .mockResolvedValueOnce({ id: "app-2" });
      mockConnectionRepo.findConnectionBetweenUsers.mockResolvedValue(null);

      const result = await service.checkConnectionStatus("user-1", "user-2");
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.data.status).toBeNull();
    });

    it("returns the connection status", async () => {
      mockAppUserRepo.findByUserId
        .mockResolvedValueOnce({ id: "app-1" })
        .mockResolvedValueOnce({ id: "app-2" });
      mockConnectionRepo.findConnectionBetweenUsers.mockResolvedValue({
        status: "ACCEPTED",
      });

      const result = await service.checkConnectionStatus("user-1", "user-2");
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.data.status).toBe("ACCEPTED");
    });
  });

  describe("getPendingRequestsReceived", () => {
    it("returns 404 when user not found", async () => {
      mockAppUserRepo.findByUserId.mockResolvedValue(null);

      const result = await service.getPendingRequestsReceived("user-1");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(404);
    });

    it("returns enriched pending requests", async () => {
      mockAppUserRepo.findByUserId.mockResolvedValue({ id: "app-1" });
      mockConnectionRepo.findPendingRequestsReceivedBy.mockResolvedValue([
        { id: "conn-1", requesterId: "app-req", createdAt: new Date() },
      ]);
      mockAppUserRepo.findByAppUserId.mockResolvedValue({
        userId: "req-user",
        role: "MENTOR",
        id: "app-req",
      });
      mockAppUserRepo.findUserNameByUserId.mockResolvedValue("John");
      mockAppUserRepo.findIdentityCardByUserId.mockResolvedValue({
        displayName: "Johnny",
        photoUrl: "/photo.jpg",
      });

      const result = await service.getPendingRequestsReceived("user-1");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0].requesterName).toBe("John");
        expect(result.data[0].requesterDisplayName).toBe("Johnny");
      }
    });

    it("filters out null entries when enrichment fails", async () => {
      mockAppUserRepo.findByUserId.mockResolvedValue({ id: "app-1" });
      mockConnectionRepo.findPendingRequestsReceivedBy.mockResolvedValue([
        { id: "conn-1", requesterId: "app-unknown", createdAt: new Date() },
      ]);
      mockAppUserRepo.findByAppUserId.mockResolvedValue(null);

      const result = await service.getPendingRequestsReceived("user-1");
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.data).toHaveLength(0);
    });
  });

  describe("getAcceptedConnections", () => {
    it("returns enriched accepted connections", async () => {
      mockAppUserRepo.findByUserId.mockResolvedValue({ id: "app-1" });
      mockConnectionRepo.findAcceptedConnectionsFor.mockResolvedValue([
        {
          id: "conn-1",
          requesterId: "app-1",
          receiverId: "app-other",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      mockAppUserRepo.findByAppUserId.mockResolvedValue({
        userId: "other-user",
        role: "APPRENANT",
        id: "app-other",
      });
      mockAppUserRepo.findUserNameByUserId.mockResolvedValue("Alice");
      mockAppUserRepo.findIdentityCardByUserId.mockResolvedValue({
        displayName: "Ali",
        photoUrl: "/alice.jpg",
      });

      const result = await service.getAcceptedConnections("user-1");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0].otherUserName).toBe("Alice");
        expect(result.data[0].otherUserRole).toBe("APPRENANT");
      }
    });

    it("identifies correct other user when current user is the receiver", async () => {
      mockAppUserRepo.findByUserId.mockResolvedValue({ id: "app-1" });
      mockConnectionRepo.findAcceptedConnectionsFor.mockResolvedValue([
        {
          id: "conn-1",
          requesterId: "app-requester",
          receiverId: "app-1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      mockAppUserRepo.findByAppUserId.mockResolvedValue({
        userId: "requester-user",
        role: "MENTOR",
        id: "app-requester",
      });
      mockAppUserRepo.findUserNameByUserId.mockResolvedValue("Bob");
      mockAppUserRepo.findIdentityCardByUserId.mockResolvedValue(null);

      const result = await service.getAcceptedConnections("user-1");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data[0].otherUserName).toBe("Bob");
        expect(result.data[0].otherUserDisplayName).toBeNull();
      }
    });
  });
});
