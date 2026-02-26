import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../../../src/lib/common/prisma", () => ({ prisma: {} }));
vi.mock("../../../../../src/lib/common/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { FeedbackModerationService } from "../../../../../src/lib/workshops/services/feedback/feedback-moderation.service";

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

  let service: FeedbackModerationService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new FeedbackModerationService(
      mockFeedbackRepo as any,
      mockMentorRepo as any,
      mockEmailService as any
    );
  });

  describe("reportFeedback", () => {
    it("returns failure when feedback not found", async () => {
      mockFeedbackRepo.findById.mockResolvedValue(null);

      const result = await service.reportFeedback("user-1", "fb-1", "spam");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe("Avis introuvable");
        expect(result.status).toBe(404);
      }
    });

    it("returns failure when mentor not found", async () => {
      mockFeedbackRepo.findById.mockResolvedValue({
        id: "fb-1",
        mentorId: "mentor-1",
        status: "ACTIVE",
      });
      mockMentorRepo.findMentorById.mockResolvedValue(null);

      const result = await service.reportFeedback("user-1", "fb-1", "spam");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe("Mentor introuvable");
        expect(result.status).toBe(404);
      }
    });

    it("returns failure when mentor is not the owner", async () => {
      mockFeedbackRepo.findById.mockResolvedValue({
        id: "fb-1",
        mentorId: "mentor-1",
        status: "ACTIVE",
      });
      mockMentorRepo.findMentorById.mockResolvedValue({
        id: "different-mentor",
      });

      const result = await service.reportFeedback("user-1", "fb-1", "spam");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.status).toBe(403);
      }
    });

    it("returns failure when feedback is already UNDER_REVIEW", async () => {
      mockFeedbackRepo.findById.mockResolvedValue({
        id: "fb-1",
        mentorId: "mentor-1",
        status: "UNDER_REVIEW",
      });
      mockMentorRepo.findMentorById.mockResolvedValue({ id: "mentor-1" });

      const result = await service.reportFeedback("user-1", "fb-1", "spam");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.status).toBe(400);
      }
    });

    it("returns failure when feedback is already DELETED", async () => {
      mockFeedbackRepo.findById.mockResolvedValue({
        id: "fb-1",
        mentorId: "mentor-1",
        status: "DELETED",
      });
      mockMentorRepo.findMentorById.mockResolvedValue({ id: "mentor-1" });

      const result = await service.reportFeedback("user-1", "fb-1", "spam");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.status).toBe(400);
      }
    });

    it("succeeds and updates status to UNDER_REVIEW", async () => {
      mockFeedbackRepo.findById.mockResolvedValue({
        id: "fb-1",
        mentorId: "mentor-1",
        status: "ACTIVE",
      });
      mockMentorRepo.findMentorById.mockResolvedValue({ id: "mentor-1" });
      mockFeedbackRepo.updateStatus.mockResolvedValue({});

      const result = await service.reportFeedback("user-1", "fb-1", "spam");
      expect(result.ok).toBe(true);
      expect(mockFeedbackRepo.updateStatus).toHaveBeenCalledWith(
        "fb-1",
        "UNDER_REVIEW",
        "user-1",
        "spam"
      );
    });
  });

  describe("dismissReport", () => {
    it("returns failure when feedback not found", async () => {
      mockFeedbackRepo.findById.mockResolvedValue(null);

      const result = await service.dismissReport("fb-1");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(404);
    });

    it("returns failure when feedback is not UNDER_REVIEW", async () => {
      mockFeedbackRepo.findById.mockResolvedValue({
        id: "fb-1",
        status: "ACTIVE",
      });

      const result = await service.dismissReport("fb-1");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(400);
    });

    it("succeeds and restores to ACTIVE", async () => {
      mockFeedbackRepo.findById.mockResolvedValue({
        id: "fb-1",
        status: "UNDER_REVIEW",
      });
      mockFeedbackRepo.updateStatus.mockResolvedValue({});

      const result = await service.dismissReport("fb-1");
      expect(result.ok).toBe(true);
      expect(mockFeedbackRepo.updateStatus).toHaveBeenCalledWith(
        "fb-1",
        "ACTIVE"
      );
    });
  });

  describe("deleteFeedback", () => {
    it("returns failure when feedback not found", async () => {
      mockFeedbackRepo.findById.mockResolvedValue(null);

      const result = await service.deleteFeedback("fb-1");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(404);
    });

    it("succeeds and marks as DELETED", async () => {
      mockFeedbackRepo.findById.mockResolvedValue({ id: "fb-1" });
      mockFeedbackRepo.updateStatus.mockResolvedValue({});

      const result = await service.deleteFeedback("fb-1");
      expect(result.ok).toBe(true);
      expect(mockFeedbackRepo.updateStatus).toHaveBeenCalledWith(
        "fb-1",
        "DELETED"
      );
    });
  });

  describe("warnUser", () => {
    it("returns failure when feedback not found", async () => {
      mockFeedbackRepo.findById.mockResolvedValue(null);

      const result = await service.warnUser("fb-1");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(404);
    });

    it("returns failure when user email not found", async () => {
      mockFeedbackRepo.findById.mockResolvedValue({
        id: "fb-1",
        apprentice: { user: { name: "John", email: null } },
      });

      const result = await service.warnUser("fb-1");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(404);
    });

    it("returns failure when email sending fails", async () => {
      mockFeedbackRepo.findById.mockResolvedValue({
        id: "fb-1",
        apprentice: { user: { name: "John", email: "john@test.com" } },
        mentor: { user: { name: "Mentor A" } },
        workshop: { title: "Atelier X" },
      });
      mockEmailService.sendEmail.mockResolvedValue({
        ok: false,
        error: "SMTP error",
      });

      const result = await service.warnUser("fb-1");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(500);
    });

    it("succeeds when email is sent", async () => {
      mockFeedbackRepo.findById.mockResolvedValue({
        id: "fb-1",
        apprentice: { user: { name: "John", email: "john@test.com" } },
        mentor: { user: { name: "Mentor A" } },
        workshop: { title: "Atelier X" },
      });
      mockEmailService.sendEmail.mockResolvedValue({ ok: true });

      const result = await service.warnUser("fb-1");
      expect(result.ok).toBe(true);
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({ to: "john@test.com" })
      );
    });
  });
});
