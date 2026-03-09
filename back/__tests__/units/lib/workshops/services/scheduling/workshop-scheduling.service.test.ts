import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../../../../src/lib/common/prisma", () => ({ prisma: {} }));
vi.mock("../../../../../../src/lib/common/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));
vi.mock(
  "../../../../../../src/lib/workshops/services/workshop-notification.service",
  () => {
    const MockNotificationService = vi.fn();
    MockNotificationService.prototype.notifyWorkshopRescheduled = vi
      .fn()
      .mockResolvedValue({ ok: true, data: { notifiedCount: 1 } });
    return { WorkshopNotificationService: MockNotificationService };
  }
);
vi.mock(
  "../../../../../../src/lib/workshops/services/scheduling/scheduling-conflict-checker",
  () => {
    const MockConflictChecker = vi.fn();
    MockConflictChecker.prototype.checkResourceConflicts = vi
      .fn()
      .mockResolvedValue({ ok: true, data: { hasConflict: false } });
    return { SchedulingConflictChecker: MockConflictChecker };
  }
);

import { WorkshopSchedulingService } from "../../../../../../src/lib/workshops/services/scheduling/workshop-scheduling.service";

describe("WorkshopSchedulingService", () => {
  const mockWorkshopRepo = {
    findById: vi.fn(),
    update: vi.fn(),
    removeApprentice: vi.fn(),
  };

  const mockAccessGuard = {
    verifyMentorAccess: vi.fn(),
    verifyApprenticeAccess: vi.fn(),
  };

  const mockNotificationService = {
    createNotification: vi.fn(),
  };

  const mockCreditService = {
    refundCreditsInTransaction: vi.fn().mockResolvedValue({ ok: true }),
  };

  const mockPrisma = {
    $transaction: vi.fn((cb) => cb(mockPrisma)),
    user: {
      findUnique: vi.fn(),
    },
    workshop: {
      update: vi.fn(),
    },
  };

  let service: WorkshopSchedulingService;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    service = new WorkshopSchedulingService(
      mockWorkshopRepo as any,
      mockAccessGuard as any,
      mockNotificationService as any,
      undefined,
      undefined,
      mockCreditService as any,
      mockPrisma as any
    );
  });

  describe("updateWorkshopScheduling", () => {
    it("returns 404 when workshop not found", async () => {
      mockWorkshopRepo.findById.mockResolvedValue(null);

      const result = await service.updateWorkshopScheduling("user-1", "ws-1", {
        date: new Date(),
      });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(404);
    });

    it("returns 403 when user is neither mentor nor apprentice", async () => {
      mockWorkshopRepo.findById.mockResolvedValue({
        id: "ws-1",
        creatorId: "other-app",
        apprenticeId: null,
      });
      mockAccessGuard.verifyMentorAccess.mockResolvedValue({
        ok: true,
        data: { appUser: { id: "different-app" } },
      });

      const result = await service.updateWorkshopScheduling("user-1", "ws-1", {
        date: new Date(),
      });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(403);
    });

    it("updates scheduling when user is the mentor/creator", async () => {
      mockWorkshopRepo.findById
        .mockResolvedValueOnce({
          id: "ws-1",
          creatorId: "app-1",
          apprenticeId: null,
        })
        .mockResolvedValueOnce({
          id: "ws-1",
          creatorId: "app-1",
          apprenticeId: null,
          title: "Test",
        });

      mockAccessGuard.verifyMentorAccess.mockResolvedValue({
        ok: true,
        data: { appUser: { id: "app-1" } },
      });
      mockWorkshopRepo.update.mockResolvedValue({});

      const result = await service.updateWorkshopScheduling("user-1", "ws-1", {
        time: "15:00",
      });
      expect(result.ok).toBe(true);
      expect(mockWorkshopRepo.update).toHaveBeenCalledWith("ws-1", { time: "15:00" });
    });

    it("updates scheduling when user is the apprentice", async () => {
      mockWorkshopRepo.findById.mockResolvedValue({
        id: "ws-1",
        creatorId: "other-app",
        apprenticeId: "app-1",
      });
      mockAccessGuard.verifyMentorAccess.mockResolvedValue({
        ok: true,
        data: { appUser: { id: "different-app" } },
      });
      mockAccessGuard.verifyApprenticeAccess.mockResolvedValue({
        ok: true,
        data: { appUser: { id: "app-1" } },
      });
      mockWorkshopRepo.update.mockResolvedValue({});

      const result = await service.updateWorkshopScheduling("user-1", "ws-1", {
        location: "Paris",
      });
      expect(result.ok).toBe(true);
    });
  });

  describe("cancelConfirmedWorkshop", () => {
    it("returns 404 when workshop not found", async () => {
      mockWorkshopRepo.findById.mockResolvedValue(null);

      const result = await service.cancelConfirmedWorkshop("user-1", "ws-1");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(404);
    });

    it("returns 403 when user is not mentor or apprentice", async () => {
      mockWorkshopRepo.findById.mockResolvedValue({
        id: "ws-1",
        creatorId: "other-app",
        apprenticeId: null,
        status: "PUBLISHED",
      });
      mockAccessGuard.verifyMentorAccess.mockResolvedValue({
        ok: true,
        data: { appUser: { id: "different-app" } },
      });

      const result = await service.cancelConfirmedWorkshop("user-1", "ws-1");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(403);
    });

    it("returns 400 when workshop is already cancelled", async () => {
      mockWorkshopRepo.findById.mockResolvedValue({
        id: "ws-1",
        creatorId: "app-1",
        apprenticeId: null,
        status: "CANCELLED",
      });
      mockAccessGuard.verifyMentorAccess.mockResolvedValue({
        ok: true,
        data: { appUser: { id: "app-1" } },
      });

      const result = await service.cancelConfirmedWorkshop("user-1", "ws-1");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(400);
    });

    it("removes apprentice when cancelled by apprentice", async () => {
      mockWorkshopRepo.findById
        .mockResolvedValueOnce({
          id: "ws-1",
          creatorId: "mentor-app",
          apprenticeId: "app-1",
          status: "PUBLISHED",
        })
        .mockResolvedValue({
          id: "ws-1",
          creatorId: "mentor-app",
          apprenticeId: "app-1",
          status: "PUBLISHED",
          creator: { user: { id: "mentor-user", name: "Mentor" } },
          apprentice: { user: { name: "Apprenti" } },
          title: "Test Workshop",
        });

      mockAccessGuard.verifyApprenticeAccess.mockResolvedValue({
        ok: true,
        data: { appUser: { id: "app-1" } },
      });
      mockWorkshopRepo.removeApprentice.mockResolvedValue(undefined);

      const result = await service.cancelConfirmedWorkshop("user-1", "ws-1");
      expect(result.ok).toBe(true);
      expect(mockWorkshopRepo.removeApprentice).toHaveBeenCalledWith("ws-1", expect.anything());
    });

    it("sets status to CANCELLED when cancelled by mentor", async () => {
      mockWorkshopRepo.findById
        .mockResolvedValueOnce({
          id: "ws-1",
          creatorId: "app-1",
          apprenticeId: null,
          status: "PUBLISHED",
        })
        .mockResolvedValue({
          id: "ws-1",
          creatorId: "app-1",
          title: "Test",
          creator: { user: { name: "Mentor" } },
          apprentice: null,
        });

      mockAccessGuard.verifyMentorAccess.mockResolvedValue({
        ok: true,
        data: { appUser: { id: "app-1" } },
      });
      mockWorkshopRepo.update.mockResolvedValue({});

      const result = await service.cancelConfirmedWorkshop("user-1", "ws-1");
      expect(result.ok).toBe(true);
      expect(mockWorkshopRepo.update).toHaveBeenCalledWith("ws-1", {
        status: "CANCELLED",
      });
    });
  });

  describe("rescheduleWorkshop", () => {
    it("returns 404 when workshop not found", async () => {
      mockWorkshopRepo.findById.mockResolvedValue(null);

      const result = await service.rescheduleWorkshop("user-1", "ws-1", {
        date: new Date("2025-07-01"),
        time: "14:00",
      });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(404);
    });

    it("returns 403 when access check fails", async () => {
      mockWorkshopRepo.findById.mockResolvedValue({ id: "ws-1" });
      mockAccessGuard.verifyMentorAccess.mockResolvedValue({
        ok: false,
        error: "Not authorized",
        status: 403,
      });

      const result = await service.rescheduleWorkshop("user-1", "ws-1", {
        date: new Date("2025-07-01"),
        time: "14:00",
      });
      expect(result.ok).toBe(false);
    });

    it("returns 403 when user is not the creator", async () => {
      mockWorkshopRepo.findById.mockResolvedValue({
        id: "ws-1",
        creatorId: "other-app",
        status: "PUBLISHED",
      });
      mockAccessGuard.verifyMentorAccess.mockResolvedValue({
        ok: true,
        data: { appUser: { id: "app-1" } },
      });

      const result = await service.rescheduleWorkshop("user-1", "ws-1", {
        date: new Date("2025-07-01"),
        time: "14:00",
      });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(403);
    });

    it("returns 400 when workshop is not published", async () => {
      mockWorkshopRepo.findById.mockResolvedValue({
        id: "ws-1",
        creatorId: "app-1",
        status: "DRAFT",
      });
      mockAccessGuard.verifyMentorAccess.mockResolvedValue({
        ok: true,
        data: { appUser: { id: "app-1" } },
      });

      const result = await service.rescheduleWorkshop("user-1", "ws-1", {
        date: new Date("2025-07-01"),
        time: "14:00",
      });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(400);
    });

    it("returns 400 for invalid time format", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-06-01T12:00:00Z"));

      mockWorkshopRepo.findById.mockResolvedValue({
        id: "ws-1",
        creatorId: "app-1",
        status: "PUBLISHED",
      });
      mockAccessGuard.verifyMentorAccess.mockResolvedValue({
        ok: true,
        data: { appUser: { id: "app-1" } },
      });

      const result = await service.rescheduleWorkshop("user-1", "ws-1", {
        date: new Date("2025-07-01"),
        time: "invalid",
      });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(400);

      vi.useRealTimers();
    });

    it("reschedules workshop successfully", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-06-01T12:00:00Z"));

      const oldDate = new Date("2025-06-10");
      mockWorkshopRepo.findById.mockResolvedValue({
        id: "ws-1",
        creatorId: "app-1",
        status: "PUBLISHED",
        date: oldDate,
        time: "10:00",
        duration: 60,
        location: "Paris",
        isVirtual: false,
      });
      mockAccessGuard.verifyMentorAccess.mockResolvedValue({
        ok: true,
        data: { appUser: { id: "app-1" } },
      });
      mockWorkshopRepo.update.mockResolvedValue({});

      const newDate = new Date("2025-07-01");
      const result = await service.rescheduleWorkshop("user-1", "ws-1", {
        date: newDate,
        time: "14:00",
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.success).toBe(true);
        expect(result.data.oldDate).toEqual(oldDate);
        expect(result.data.oldTime).toBe("10:00");
      }
      expect(mockWorkshopRepo.update).toHaveBeenCalledWith(
        "ws-1",
        expect.objectContaining({ date: newDate, time: "14:00" })
      );

      vi.useRealTimers();
    });
  });
});
