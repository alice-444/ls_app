import { describe, it, expect, vi, beforeEach } from "vitest";
import { failure, success } from "@/lib/common/types";
import { WorkshopNotificationService } from "@/lib/workshops/services/workshop-notification.service";

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
        new Date(),
        "10:00"
      );
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(404);
    });

    it("returns notifiedCount 0 when workshop has no apprentice", async () => {
      mockWorkshopRepo.findById.mockResolvedValue({ id: "ws-1", apprenticeId: null });
      const result = await service.notifyWorkshopRescheduled(
        "ws-1",
        null,
        null,
        new Date(),
        "10:00"
      );
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.data.notifiedCount).toBe(0);
    });

    it("notifies apprentice and returns notifiedCount 1", async () => {
      const now = new Date();
      mockWorkshopRepo.findById.mockResolvedValue({
        id: "ws-1",
        title: "Atelier test",
        apprenticeId: "app-1",
        apprentice: {
          id: "app-1",
          userId: "user-apprentice",
          email: "app@example.com",
          name: "Apprentice",
        },
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
  });
});
