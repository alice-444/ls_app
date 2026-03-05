import { describe, it, expect, vi, beforeEach } from "vitest";
import { success, failure } from "@/lib/common/types";
import { WorkshopFeedbackService } from "@/lib/workshops/services/feedback/workshop-feedback.service";

describe("WorkshopFeedbackService", () => {
  const mockFeedbackRepo = {
    create: vi.fn(),
    findByWorkshopId: vi.fn(),
    findByApprenticeAndWorkshop: vi.fn(),
  };
  const mockWorkshopService = {
    getWorkshopById: vi.fn(),
  };
  const mockCreditService = {
    creditCredits: vi.fn(),
  };
  const mockNotificationService = {
    createNotification: vi.fn(),
  };

  let service: WorkshopFeedbackService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new WorkshopFeedbackService(
      mockFeedbackRepo as any,
      mockWorkshopService as any,
      mockCreditService as any,
      mockNotificationService as any
    );
  });

  describe("canSubmitFeedback", () => {
    it("returns canSubmit:false when workshop not found", async () => {
      mockWorkshopService.getWorkshopById.mockResolvedValue(failure("Not found"));
      
      const result = await service.canSubmitFeedback("user-1", "ws-1");
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.data.canSubmit).toBe(false);
    });

    it("returns canSubmit:true when all conditions met", async () => {
      const wsData = {
        id: "ws-1",
        apprenticeId: "app-1",
        apprentice: { userId: "user-1" },
        date: new Date("2020-01-01"),
        time: "10:00",
        duration: 60,
        status: "COMPLETED",
      };
      mockWorkshopService.getWorkshopById.mockResolvedValue(success(wsData as any));
      mockFeedbackRepo.findByApprenticeAndWorkshop.mockResolvedValue(null);

      const result = await service.canSubmitFeedback("user-1", "ws-1");
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.data.canSubmit).toBe(true);
    });
  });

  describe("submitFeedback", () => {
    const validInput = {
      workshopId: "ws-1",
      rating: 5,
      comment: "Great!",
      isAnonymous: false,
    };

    it("submits feedback and rewards credit", async () => {
      const wsData = {
        id: "ws-1",
        creatorId: "mentor-1",
        apprenticeId: "app-1",
        apprentice: { userId: "user-1", name: "Apprentice" },
        status: "COMPLETED",
        date: new Date("2020-01-01"),
        time: "10:00",
        duration: 60,
      };
      mockWorkshopService.getWorkshopById.mockResolvedValue(success(wsData as any));
      mockFeedbackRepo.findByApprenticeAndWorkshop.mockResolvedValue(null);
      mockFeedbackRepo.create.mockResolvedValue({ id: "fb-new" });
      mockCreditService.creditCredits.mockResolvedValue(success({}));

      const result = await service.submitFeedback("user-1", validInput);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.feedbackId).toBe("fb-new");
      }
      expect(mockCreditService.creditCredits).toHaveBeenCalledWith(
        "user-1",
        1,
        "Récompense pour avis"
      );
      expect(mockNotificationService.createNotification).toHaveBeenCalled();
    });
  });
});
