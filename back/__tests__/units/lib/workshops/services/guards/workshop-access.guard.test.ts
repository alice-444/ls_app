import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../../../../src/lib/common/prisma", () => ({ prisma: {} }));
vi.mock("../../../../../../src/lib/auth/services/user-helpers", () => ({
  verifyUserExists: vi.fn(),
  verifyMentorUser: vi.fn(),
}));

import { WorkshopAccessGuard } from "../../../../../../src/lib/workshops/services/guards/workshop-access.guard";
import {
  verifyUserExists,
  verifyMentorUser,
} from "../../../../../../src/lib/auth/services/user-helpers";

const mockVerifyUserExists = vi.mocked(verifyUserExists);
const mockVerifyMentorUser = vi.mocked(verifyMentorUser);

describe("WorkshopAccessGuard", () => {
  const mockAppUserRepo = {
    findByUserId: vi.fn(),
  };

  const mockWorkshopRepo = {
    checkCreatorOwnership: vi.fn(),
  };

  let guard: WorkshopAccessGuard;

  beforeEach(() => {
    vi.clearAllMocks();
    guard = new WorkshopAccessGuard(
      mockAppUserRepo as any,
      mockWorkshopRepo as any,
    );
  });

  describe("verifyMentorAccess", () => {
    it("returns failure when user does not exist", async () => {
      mockVerifyUserExists.mockResolvedValue({
        ok: false,
        error: "User not found",
        status: 404,
      });

      const result = await guard.verifyMentorAccess("user-1");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(404);
    });

    it("returns failure when user is not a MENTOR", async () => {
      mockVerifyUserExists.mockResolvedValue({
        ok: true,
        data: { user: { id: "user-1", userId: "user-1" } },
      });
      mockVerifyMentorUser.mockResolvedValue({
        ok: false,
        error: "Only users with MENTOR role can perform this action",
        status: 403,
      });

      const result = await guard.verifyMentorAccess("user-1");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(403);
    });

    it("returns success with appUser when user is an active MENTOR", async () => {
      const appUser = {
        id: "app-1",
        userId: "user-1",
        name: "Test User",
        email: "test@example.com",
        displayName: "Test",
        role: "MENTOR",
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
        emailNotifications: true,
        title: "Explorer",
        inAppNotifications: true,
      };
      mockVerifyUserExists.mockResolvedValue({
        ok: true,
        data: { user: { id: "user-1", userId: "user-1" } },
      });
      mockVerifyMentorUser.mockResolvedValue({
        ok: true,
        data: { appUser: { ...appUser, title: "Explorer" } },
      });

      const result = await guard.verifyMentorAccess("user-1");
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.data.appUser).toEqual(appUser);
    });
  });

  describe("verifyWorkshopOwnership", () => {
    it("returns failure when prof access check fails", async () => {
      mockVerifyUserExists.mockResolvedValue({
        ok: false,
        error: "User not found",
        status: 404,
      });

      const result = await guard.verifyWorkshopOwnership(
        "user-1",
        "ws-1",
        "modifier",
      );
      expect(result.ok).toBe(false);
    });

    it("returns failure when appUser is null", async () => {
      mockVerifyUserExists.mockResolvedValue({
        ok: true,
        data: { user: { id: "user-1", userId: "user-1" } },
      });
      mockVerifyMentorUser.mockResolvedValue({
        ok: true,
        data: { appUser: null },
      });

      const result = await guard.verifyWorkshopOwnership(
        "user-1",
        "ws-1",
        "modifier",
      );
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(404);
    });

    it("returns failure when user is not the workshop owner", async () => {
      mockVerifyUserExists.mockResolvedValue({
        ok: true,
        data: { user: { id: "user-1", userId: "user-1" } },
      });
      mockVerifyMentorUser.mockResolvedValue({
        ok: true,
        data: {
          appUser: {
            id: "app-1",
            userId: "user-1",
            name: "Test User",
            email: "test@example.com",
            displayName: "Test",
            role: "MENTOR",
            status: "ACTIVE",
            createdAt: new Date(),
            updatedAt: new Date(),
            emailNotifications: true,
            title: "Explorer",
            inAppNotifications: true,
          },
        },
      });
      mockWorkshopRepo.checkCreatorOwnership.mockResolvedValue(false);

      const result = await guard.verifyWorkshopOwnership(
        "user-1",
        "ws-1",
        "supprimer",
      );
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.status).toBe(403);
        expect(result.error).toContain("supprimer");
      }
    });

    it("returns success when user owns the workshop", async () => {
      mockVerifyUserExists.mockResolvedValue({
        ok: true,
        data: { user: { id: "user-1", userId: "user-1" } },
      });
      mockVerifyMentorUser.mockResolvedValue({
        ok: true,
        data: {
          appUser: {
            id: "app-1",
            userId: "user-1",
            name: "Test User",
            email: "test@example.com",
            displayName: "Test",
            role: "MENTOR",
            status: "ACTIVE",
            createdAt: new Date(),
            updatedAt: new Date(),
            emailNotifications: true,
            title: "Explorer",
            inAppNotifications: true,
          },
        },
      });
      mockWorkshopRepo.checkCreatorOwnership.mockResolvedValue(true);

      const result = await guard.verifyWorkshopOwnership(
        "user-1",
        "ws-1",
        "modifier",
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.appUser.id).toBe("app-1");
        expect(result.data.workshopId).toBe("ws-1");
      }
    });
  });

  describe("verifyApprenticeAccess", () => {
    it("returns failure when appUser not found", async () => {
      mockAppUserRepo.findByUserId.mockResolvedValue(null);

      const result = await guard.verifyApprenticeAccess("user-1");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(404);
    });

    it("returns failure when user is not APPRENANT", async () => {
      mockAppUserRepo.findByUserId.mockResolvedValue({
        id: "app-1",
        userId: "user-1",
        name: "Test User",
        email: "test@example.com",
        displayName: "Test",
        role: "MENTOR",
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
        emailNotifications: true,
        title: "Explorer",
        inAppNotifications: true,
      });

      const result = await guard.verifyApprenticeAccess("user-1");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(403);
    });

    it("returns failure when account is not active", async () => {
      mockAppUserRepo.findByUserId.mockResolvedValue({
        id: "app-1",
        userId: "user-1",
        name: "Test User",
        email: "test@example.com",
        displayName: "Test",
        role: "APPRENANT",
        status: "INACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
        emailNotifications: true,
        title: "Explorer",
        inAppNotifications: true,
      });

      const result = await guard.verifyApprenticeAccess("user-1");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(403);
    });

    it("returns success for active APPRENANT", async () => {
      const appUser = {
        id: "app-1",
        userId: "user-1",
        name: "Test User",
        email: "test@example.com",
        displayName: "Test",
        role: "APPRENANT",
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
        emailNotifications: true,
        title: "Explorer",
        inAppNotifications: true,
      };
      mockAppUserRepo.findByUserId.mockResolvedValue(appUser);

      const result = await guard.verifyApprenticeAccess("user-1");
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.data.appUser).toEqual(appUser);
    });
  });
});
