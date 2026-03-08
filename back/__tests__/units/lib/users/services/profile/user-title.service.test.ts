import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserTitleService } from "@/lib/users/services/profile/user-title.service";

describe("UserTitleService", () => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    workshop: {
      count: vi.fn(),
    },
  };

  let service: UserTitleService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new UserTitleService(mockPrisma as any);
  });

  describe("getTitleForCount", () => {
    it("returns Explorer for 0", () => {
      expect(service.getTitleForCount(0)).toBe("Explorer");
    });

    it("returns Explorer for 5", () => {
      expect(service.getTitleForCount(5)).toBe("Explorer");
    });

    it("returns Challenger for 6", () => {
      expect(service.getTitleForCount(6)).toBe("Challenger");
    });

    it("returns Challenger for 10", () => {
      expect(service.getTitleForCount(10)).toBe("Challenger");
    });

    it("returns Achiever for 11", () => {
      expect(service.getTitleForCount(11)).toBe("Achiever");
    });

    it("returns Achiever for 20", () => {
      expect(service.getTitleForCount(20)).toBe("Achiever");
    });

    it("returns Visionary for 21", () => {
      expect(service.getTitleForCount(21)).toBe("Visionary");
    });

    it("returns Visionary for 100", () => {
      expect(service.getTitleForCount(100)).toBe("Visionary");
    });
  });

  describe("updateTitleBasedOnWorkshops", () => {
    it("returns failure when user not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await service.updateTitleBasedOnWorkshops("user-1");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe("App user not found");
        expect(result.status).toBe(404);
      }
    });

    it("updates title when it changes", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "internal-1",
        userId: "user-1",
        title: "Explorer",
      });
      mockPrisma.workshop.count.mockResolvedValue(6);
      mockPrisma.user.update.mockResolvedValue({ title: "Challenger" });

      const result = await service.updateTitleBasedOnWorkshops("user-1");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.previousTitle).toBe("Explorer");
        expect(result.data.newTitle).toBe("Challenger");
        expect(result.data.titleChanged).toBe(true);
      }
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        data: { title: "Challenger" },
      });
    });

    it("does not update when title stays the same", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "internal-1",
        userId: "user-1",
        title: "Explorer",
      });
      mockPrisma.workshop.count.mockResolvedValue(2);

      const result = await service.updateTitleBasedOnWorkshops("user-1");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.titleChanged).toBe(false);
      }
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it("returns failure on exception", async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error("DB error"));

      const result = await service.updateTitleBasedOnWorkshops("user-1");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe("DB error");
        expect(result.status).toBe(500);
      }
    });
  });
});
