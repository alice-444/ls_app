import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../../../src/lib/common/prisma", () => ({ prisma: {} }));

import { MessageValidationService } from "../../../../../src/lib/messaging/services/validation/message-validation.service";

describe("MessageValidationService", () => {
  let service: MessageValidationService;

  beforeEach(() => {
    vi.useRealTimers();
    service = new MessageValidationService();
  });

  describe("validateMessageContent", () => {
    it("returns failure for empty string", () => {
      const result = service.validateMessageContent("");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(400);
    });

    it("returns failure for whitespace-only string", () => {
      const result = service.validateMessageContent("   ");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(400);
    });

    it("returns failure for message exceeding 5000 chars", () => {
      const longMessage = "a".repeat(5001);
      const result = service.validateMessageContent(longMessage);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain("5000");
        expect(result.status).toBe(400);
      }
    });

    it("returns sanitized content for valid message", () => {
      const result = service.validateMessageContent("Hello world");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toBe("Hello world");
      }
    });

    it("strips HTML tags from content", () => {
      const result = service.validateMessageContent(
        "<script>alert('xss')</script>Hello"
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).not.toContain("<script>");
      }
    });

    it("accepts message at exactly 5000 chars", () => {
      const result = service.validateMessageContent("a".repeat(5000));
      expect(result.ok).toBe(true);
    });
  });

  describe("canEditMessage", () => {
    it("returns failure for system messages", () => {
      const result = service.canEditMessage(new Date(), 0, true);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain("System messages");
        expect(result.status).toBe(403);
      }
    });

    it("returns failure when message is older than 15 minutes", () => {
      const oldDate = new Date(Date.now() - 16 * 60 * 1000);
      const result = service.canEditMessage(oldDate, 0, false);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain("15 minutes");
        expect(result.status).toBe(403);
      }
    });

    it("returns failure when edit count >= 5", () => {
      const recentDate = new Date(Date.now() - 1000);
      const result = service.canEditMessage(recentDate, 5, false);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain("5 times");
        expect(result.status).toBe(403);
      }
    });

    it("returns success when message is recent and edit count < 5", () => {
      const recentDate = new Date(Date.now() - 1000);
      const result = service.canEditMessage(recentDate, 3, false);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toBe(true);
      }
    });

    it("allows editing at exactly 0 edits", () => {
      const recentDate = new Date(Date.now() - 1000);
      const result = service.canEditMessage(recentDate, 0, false);
      expect(result.ok).toBe(true);
    });
  });

  describe("canDeleteMessage", () => {
    it("returns failure for system messages", () => {
      const result = service.canDeleteMessage(new Date(), true);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain("System messages");
        expect(result.status).toBe(403);
      }
    });

    it("returns failure when message is older than 5 minutes", () => {
      const oldDate = new Date(Date.now() - 6 * 60 * 1000);
      const result = service.canDeleteMessage(oldDate, false);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain("5 minutes");
        expect(result.status).toBe(403);
      }
    });

    it("returns success when message is recent and not system", () => {
      const recentDate = new Date(Date.now() - 1000);
      const result = service.canDeleteMessage(recentDate, false);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toBe(true);
      }
    });
  });

  describe("static methods", () => {
    it("getMaxMessageLength returns 5000", () => {
      expect(MessageValidationService.getMaxMessageLength()).toBe(5000);
    });

    it("getMaxEditCount returns 5", () => {
      expect(MessageValidationService.getMaxEditCount()).toBe(5);
    });

    it("getEditTimeLimitMs returns 15 minutes in ms", () => {
      expect(MessageValidationService.getEditTimeLimitMs()).toBe(
        15 * 60 * 1000
      );
    });

    it("getDeleteTimeLimitMs returns 5 minutes in ms", () => {
      expect(MessageValidationService.getDeleteTimeLimitMs()).toBe(
        5 * 60 * 1000
      );
    });
  });
});
