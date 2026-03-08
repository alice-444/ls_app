import { describe, it, expect, vi, beforeEach } from "vitest";
import { success, failure } from "@/lib/common/types";
import { FeedbackModerationService } from "@/lib/workshops/services/feedback/feedback-moderation.service";

describe("FeedbackModerationService", () => {
  const mockFeedbackRepo = {
    findById: vi.fn(),
    updateStatus: vi.fn(),
    findUnderReview: vi.fn(),
    countUnderReview: vi.fn(),
  };
  const mockMentorRepo = {
    findMentorById: vi.fn(),
  };
  const mockEmailService = {
    sendEmail: vi.fn(),
  };
  const mockNotificationService = {
    notifyAdmin: vi.fn(),
  };

  let service: FeedbackModerationService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new FeedbackModerationService(
      mockFeedbackRepo as any,
      mockMentorRepo as any,
      mockEmailService as any,
      mockNotificationService as any
    );
  });

  describe("reportFeedback", () => {
    it("returns failure when feedback not found", async () => {
      mockFeedbackRepo.findById.mockResolvedValue(null);
      const result = await service.reportFeedback("user-1", "fb-1", "spam");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(404);
    });

    it("succeeds and updates status to UNDER_REVIEW", async () => {
      mockFeedbackRepo.findById.mockResolvedValue({
        id: "fb-1",
        mentorId: "mentor-1",
        status: "ACTIVE",
        workshop: { title: "Atelier" },
      });
      mockMentorRepo.findMentorById.mockResolvedValue({
        id: "mentor-1",
        user: { name: "Mentor Name" },
      });

      const result = await service.reportFeedback("user-1", "fb-1", "spam");
      expect(result.ok).toBe(true);
      expect(mockFeedbackRepo.updateStatus).toHaveBeenCalledWith(
        "fb-1",
        "UNDER_REVIEW",
        "user-1",
        "spam"
      );
      expect(mockNotificationService.notifyAdmin).toHaveBeenCalledWith(
        "NEW_FEEDBACK_MODERATION",
        expect.stringContaining("Mentor Name"),
        expect.stringContaining("fb-1")
      );
    });
  });

  describe("dismissReport", () => {
    it("succeeds and restores to ACTIVE", async () => {
      mockFeedbackRepo.findById.mockResolvedValue({
        id: "fb-1",
        status: "UNDER_REVIEW",
      });

      const result = await service.dismissReport("fb-1");
      expect(result.ok).toBe(true);
      expect(mockFeedbackRepo.updateStatus).toHaveBeenCalledWith("fb-1", "ACTIVE");
    });
  });

  describe("deleteFeedback", () => {
    it("succeeds and marks as DELETED", async () => {
      mockFeedbackRepo.findById.mockResolvedValue({ id: "fb-1" });
      const result = await service.deleteFeedback("fb-1");
      expect(result.ok).toBe(true);
      expect(mockFeedbackRepo.updateStatus).toHaveBeenCalledWith("fb-1", "DELETED");
    });
  });

  describe("warnUser", () => {
    it("succeeds when email is sent", async () => {
      mockFeedbackRepo.findById.mockResolvedValue({
        id: "fb-1",
        apprentice: { user: { name: "Apprentice", email: "app@example.com" } },
        mentor: { user: { name: "Mentor" } },
        workshop: { title: "Atelier" },
      });
      mockEmailService.sendEmail.mockResolvedValue(success({}));

      const result = await service.warnUser("fb-1");
      expect(result.ok).toBe(true);
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({ to: "app@example.com" })
      );
    });
  });
});
