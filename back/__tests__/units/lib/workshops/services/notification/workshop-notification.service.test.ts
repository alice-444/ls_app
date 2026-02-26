import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../../../../src/lib/common/prisma", () => ({ prisma: {} }));
vi.mock("../../../../../../src/lib/common/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));
vi.mock("../../../../../../src/lib/di/container", () => ({
  container: {
    prisma: { user: { findUnique: vi.fn() } },
    emailService: { sendEmail: vi.fn() },
  },
}));

import { WorkshopNotificationService } from "../../../../../../src/lib/workshops/services/workshop-notification.service";
import { container } from "../../../../../../src/lib/di/container";

const mockContainer = vi.mocked(container);

describe("WorkshopNotificationService", () => {
  const mockWorkshopRepo = {
    findById: vi.fn(),
  };

  const mockNotificationService = {
    createNotification: vi.fn(),
  };

  const mockAppUserRepo = {
    findByAppUserId: vi.fn(),
  };

  let service: WorkshopNotificationService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new WorkshopNotificationService(
      mockWorkshopRepo as any,
      mockNotificationService as any,
      mockAppUserRepo as any
    );
  });

  describe("notifyWorkshopRescheduled", () => {
    it("returns 404 when workshop not found", async () => {
      mockWorkshopRepo.findById.mockResolvedValue(null);

      const result = await service.notifyWorkshopRescheduled(
        "ws-1",
        null,
        null,
        new Date("2025-07-01"),
        "14:00"
      );
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(404);
    });

    it("returns notifiedCount 0 when workshop has no apprentice", async () => {
      mockWorkshopRepo.findById.mockResolvedValue({
        id: "ws-1",
        title: "Test",
        apprenticeId: null,
        apprentice: null,
      });

      const result = await service.notifyWorkshopRescheduled(
        "ws-1",
        null,
        null,
        new Date("2025-07-01"),
        "14:00"
      );
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.data.notifiedCount).toBe(0);
    });

    it("notifies apprentice and returns notifiedCount 1", async () => {
      mockWorkshopRepo.findById.mockResolvedValue({
        id: "ws-1",
        title: "Atelier test",
        apprenticeId: "app-1",
        apprentice: {
          id: "app-1",
          user: {
            id: "user-apprentice",
            email: "apprentice@test.com",
            name: "Apprenti",
          },
        },
        location: "Paris",
        duration: 60,
      });
      (mockContainer.emailService.sendEmail as any).mockResolvedValue({
        ok: true,
      });

      const result = await service.notifyWorkshopRescheduled(
        "ws-1",
        new Date("2025-06-15"),
        "10:00",
        new Date("2025-07-01"),
        "14:00",
        "sender-user"
      );

      expect(result.ok).toBe(true);
      if (result.ok) expect(result.data.notifiedCount).toBe(1);

      expect(mockNotificationService.createNotification).toHaveBeenCalledWith(
        "user-apprentice",
        expect.objectContaining({
          type: "workshop",
          title: "Changement d'horaire",
        }),
        "sender-user"
      );
    });

    it("looks up apprenticeUserId via appUserRepository when not in workshop data", async () => {
      mockWorkshopRepo.findById.mockResolvedValue({
        id: "ws-1",
        title: "Atelier",
        apprenticeId: "app-1",
        apprentice: {
          id: "app-1",
          user: null,
        },
        location: null,
        duration: null,
      });
      mockAppUserRepo.findByAppUserId.mockResolvedValue({
        userId: "found-user-id",
      });
      (mockContainer.prisma.user.findUnique as any).mockResolvedValue({
        email: "found@test.com",
      });
      (mockContainer.emailService.sendEmail as any).mockResolvedValue({
        ok: true,
      });

      const result = await service.notifyWorkshopRescheduled(
        "ws-1",
        null,
        null,
        new Date("2025-07-01"),
        "14:00"
      );

      expect(result.ok).toBe(true);
      if (result.ok) expect(result.data.notifiedCount).toBe(1);
      expect(mockAppUserRepo.findByAppUserId).toHaveBeenCalledWith("app-1");
      expect(mockNotificationService.createNotification).toHaveBeenCalledWith(
        "found-user-id",
        expect.any(Object),
        undefined
      );
    });

    it("does not create DB notification when dbNotificationService is not provided", async () => {
      const serviceWithoutNotif = new WorkshopNotificationService(
        mockWorkshopRepo as any,
        undefined,
        mockAppUserRepo as any
      );

      mockWorkshopRepo.findById.mockResolvedValue({
        id: "ws-1",
        title: "Atelier",
        apprenticeId: "app-1",
        apprentice: {
          id: "app-1",
          user: { id: "user-1", email: "test@test.com", name: "Test" },
        },
        location: null,
        duration: null,
      });
      (mockContainer.emailService.sendEmail as any).mockResolvedValue({
        ok: true,
      });

      const result = await serviceWithoutNotif.notifyWorkshopRescheduled(
        "ws-1",
        null,
        null,
        new Date("2025-07-01"),
        "14:00"
      );

      expect(result.ok).toBe(true);
      expect(mockNotificationService.createNotification).not.toHaveBeenCalled();
    });
  });
});
