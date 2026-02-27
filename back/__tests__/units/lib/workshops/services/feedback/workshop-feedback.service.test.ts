import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../../../../src/lib/common/prisma", () => ({ prisma: {} }));
vi.mock("../../../../../../src/lib/common/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));
vi.mock("../../../../../../src/lib/di/container", () => ({
  container: {
    emailService: {
      sendEmail: vi.fn().mockResolvedValue({ ok: true }),
    },
    prisma: {
      app_user: {
        findUnique: vi.fn().mockResolvedValue({ userId: "mentor-user-1" }),
      },
    },
  },
}));

import { WorkshopFeedbackService } from "../../../../../../src/lib/workshops/services/feedback/workshop-feedback.service";

describe("WorkshopFeedbackService", () => {
  const mockFeedbackRepo = {
    findById: vi.fn(),
    findByApprenticeIdAndWorkshopId: vi.fn(),
    findByWorkshopId: vi.fn(),
    create: vi.fn(),
    updateStatus: vi.fn(),
    findUnderReview: vi.fn(),
    countUnderReview: vi.fn(),
  };

  const mockWorkshopRepo = {
    findById: vi.fn(),
    findByApprenticeId: vi.fn(),
  };

  const mockMentorRepo = {
    findApprenticeByUserId: vi.fn(),
    findMentorById: vi.fn(),
  };

  const mockCreditService = {
    creditCredits: vi.fn(),
  };

  const mockEmailService = {
    sendEmail: vi.fn(),
  };

  let service: WorkshopFeedbackService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new WorkshopFeedbackService(
      mockFeedbackRepo as any,
      mockWorkshopRepo as any,
      mockMentorRepo as any,
      mockCreditService as any,
      mockEmailService as any
    );
  });

  describe("canSubmitFeedback", () => {
    it("returns canSubmit:false when workshop not found", async () => {
      mockWorkshopRepo.findById.mockResolvedValue(null);

      const result = await service.canSubmitFeedback("user-1", "ws-1");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.canSubmit).toBe(false);
        expect(result.data.reason).toContain("introuvable");
      }
    });

    it("returns canSubmit:false when user is not an apprentice", async () => {
      mockWorkshopRepo.findById.mockResolvedValue({
        id: "ws-1",
        apprenticeId: "app-1",
      });
      mockMentorRepo.findApprenticeByUserId.mockResolvedValue(null);

      const result = await service.canSubmitFeedback("user-1", "ws-1");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.canSubmit).toBe(false);
        expect(result.data.reason).toContain("apprentis");
      }
    });

    it("returns canSubmit:false when user is not enrolled", async () => {
      mockWorkshopRepo.findById.mockResolvedValue({
        id: "ws-1",
        apprenticeId: "other-app",
      });
      mockMentorRepo.findApprenticeByUserId.mockResolvedValue({
        id: "app-1",
      });

      const result = await service.canSubmitFeedback("user-1", "ws-1");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.canSubmit).toBe(false);
        expect(result.data.reason).toContain("inscrit");
      }
    });

    it("returns canSubmit:false when workshop has no date/time", async () => {
      mockWorkshopRepo.findById.mockResolvedValue({
        id: "ws-1",
        apprenticeId: "app-1",
        date: null,
        time: null,
      });
      mockMentorRepo.findApprenticeByUserId.mockResolvedValue({
        id: "app-1",
      });

      const result = await service.canSubmitFeedback("user-1", "ws-1");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.canSubmit).toBe(false);
        expect(result.data.reason).toContain("date");
      }
    });

    it("returns canSubmit:false when workshop is not yet finished", async () => {
      const futureDate = new Date(Date.now() + 86400000);
      mockWorkshopRepo.findById.mockResolvedValue({
        id: "ws-1",
        apprenticeId: "app-1",
        date: futureDate,
        time: "14:00",
        duration: 60,
      });
      mockMentorRepo.findApprenticeByUserId.mockResolvedValue({
        id: "app-1",
      });

      const result = await service.canSubmitFeedback("user-1", "ws-1");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.canSubmit).toBe(false);
        expect(result.data.reason).toContain("terminé");
      }
    });

    it("returns canSubmit:false when feedback already submitted", async () => {
      const pastDate = new Date("2020-01-01");
      mockWorkshopRepo.findById.mockResolvedValue({
        id: "ws-1",
        apprenticeId: "app-1",
        date: pastDate,
        time: "10:00",
        duration: 60,
      });
      mockMentorRepo.findApprenticeByUserId.mockResolvedValue({
        id: "app-1",
      });
      mockFeedbackRepo.findByApprenticeIdAndWorkshopId.mockResolvedValue({
        id: "fb-existing",
      });

      const result = await service.canSubmitFeedback("user-1", "ws-1");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.canSubmit).toBe(false);
        expect(result.data.reason).toContain("déjà soumis");
      }
    });

    it("returns canSubmit:true when all conditions met", async () => {
      const pastDate = new Date("2020-01-01");
      mockWorkshopRepo.findById.mockResolvedValue({
        id: "ws-1",
        apprenticeId: "app-1",
        date: pastDate,
        time: "10:00",
        duration: 60,
      });
      mockMentorRepo.findApprenticeByUserId.mockResolvedValue({
        id: "app-1",
      });
      mockFeedbackRepo.findByApprenticeIdAndWorkshopId.mockResolvedValue(null);

      const result = await service.canSubmitFeedback("user-1", "ws-1");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.canSubmit).toBe(true);
      }
    });
  });

  describe("submitFeedback", () => {
    const validInput = {
      workshopId: "ws-1",
      rating: 4,
      comment: "Great!",
      isAnonymous: false,
    };

    function setupCanSubmit() {
      const pastDate = new Date("2020-01-01");
      mockWorkshopRepo.findById.mockResolvedValue({
        id: "ws-1",
        apprenticeId: "app-1",
        creatorId: "creator-1",
        date: pastDate,
        time: "10:00",
        duration: 60,
      });
      mockMentorRepo.findApprenticeByUserId.mockResolvedValue({
        id: "app-1",
      });
      mockFeedbackRepo.findByApprenticeIdAndWorkshopId.mockResolvedValue(null);
    }

    it("returns failure when rating < 1", async () => {
      setupCanSubmit();
      mockFeedbackRepo.create.mockResolvedValue({ id: "fb-1" });

      const result = await service.submitFeedback("user-1", {
        ...validInput,
        rating: 0,
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain("1 et 5");
      }
    });

    it("returns failure when rating > 5", async () => {
      setupCanSubmit();

      const result = await service.submitFeedback("user-1", {
        ...validInput,
        rating: 6,
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain("1 et 5");
      }
    });

    it("submits feedback and rewards credit", async () => {
      setupCanSubmit();
      mockFeedbackRepo.create.mockResolvedValue({ id: "fb-new" });
      mockCreditService.creditCredits.mockResolvedValue({ ok: true });

      const result = await service.submitFeedback("user-1", validInput);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.feedbackId).toBe("fb-new");
        expect(result.data.creditRewarded).toBe(true);
      }
      expect(mockFeedbackRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          rating: 4,
          comment: "Great!",
          isAnonymous: false,
        })
      );
      expect(mockCreditService.creditCredits).toHaveBeenCalled();
    });

    it("still succeeds when credit reward fails", async () => {
      setupCanSubmit();
      mockFeedbackRepo.create.mockResolvedValue({ id: "fb-new" });
      mockCreditService.creditCredits.mockResolvedValue({
        ok: false,
        error: "credit error",
      });

      const result = await service.submitFeedback("user-1", validInput);
      expect(result.ok).toBe(true);
    });
  });
});
