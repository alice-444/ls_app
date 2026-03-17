import { describe, it, expect, vi, beforeEach } from "vitest";
import { MessageValidationService } from "@/lib/messaging/services/validation/message-validation.service";

describe("MessageValidationService", () => {
  let service: MessageValidationService;

  beforeEach(() => {
    service = new MessageValidationService();
    vi.useFakeTimers();
  });

  describe("validateMessageContent", () => {
    it("returns success for valid content", () => {
      const result = service.validateMessageContent("  Hello world  ");
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.data).toBe("Hello world");
    });

    it("fails for empty content", () => {
      const result = service.validateMessageContent("   ");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toBe("Message content cannot be empty");
    });

    it("fails for content exceeding max length", () => {
      const longContent = "a".repeat(5001);
      const result = service.validateMessageContent(longContent);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toContain("cannot exceed 5000 characters");
    });
  });

  describe("canEditMessage", () => {
    it("returns success if within time and edit limit", () => {
      const now = new Date();
      vi.setSystemTime(now);
      const createdAt = new Date(now.getTime() - 10 * 60 * 1000); // 10 mins ago
      
      const result = service.canEditMessage(createdAt, 2, false);
      expect(result.ok).toBe(true);
    });

    it("fails if message is too old (16 mins)", () => {
      const now = new Date();
      vi.setSystemTime(now);
      const createdAt = new Date(now.getTime() - 16 * 60 * 1000);
      
      const result = service.canEditMessage(createdAt, 0, false);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toContain("within 15 minutes");
    });

    it("fails if max edits reached", () => {
      const createdAt = new Date();
      const result = service.canEditMessage(createdAt, 5, false);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toContain("5 times");
    });

    it("fails for system messages", () => {
      const result = service.canEditMessage(new Date(), 0, true);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toBe("System messages cannot be edited");
    });
  });

  describe("canDeleteMessage", () => {
    it("returns success if within 5 minutes", () => {
      const now = new Date();
      vi.setSystemTime(now);
      const createdAt = new Date(now.getTime() - 4 * 60 * 1000);
      
      const result = service.canDeleteMessage(createdAt, false);
      expect(result.ok).toBe(true);
    });

    it("fails if older than 5 minutes", () => {
      const now = new Date();
      vi.setSystemTime(now);
      const createdAt = new Date(now.getTime() - 6 * 60 * 1000);
      
      const result = service.canDeleteMessage(createdAt, false);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toContain("within 5 minutes");
    });
  });
});
