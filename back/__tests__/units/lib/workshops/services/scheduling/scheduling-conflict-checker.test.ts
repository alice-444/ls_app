import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../../../../src/lib/common/prisma", () => ({ prisma: {} }));
vi.mock("../../../../../../src/lib/common/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { SchedulingConflictChecker } from "../../../../../../src/lib/workshops/services/scheduling/scheduling-conflict-checker";

describe("SchedulingConflictChecker", () => {
  const mockWorkshopRepo = {
    findByCreatorId: vi.fn(),
    findPublished: vi.fn(),
  };

  let checker: SchedulingConflictChecker;

  beforeEach(() => {
    vi.clearAllMocks();
    checker = new SchedulingConflictChecker(mockWorkshopRepo as any);
  });

  describe("checkResourceConflicts", () => {
    const baseDate = new Date("2025-06-15");
    const baseTime = "14:00";
    const baseDuration = 60;

    it("returns failure when times cannot be calculated", async () => {
      const result = await checker.checkResourceConflicts(
        "mentor-1",
        "ws-new",
        null as any,
        "",
        0,
        null,
        false
      );
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(400);
    });

    it("detects mentor time conflict", async () => {
      mockWorkshopRepo.findByCreatorId.mockResolvedValue([
        {
          id: "ws-existing",
          title: "Existing Workshop",
          status: "CONFIRMED",
          date: new Date("2025-06-15"),
          time: "14:30",
          duration: 60,
        },
      ]);

      const result = await checker.checkResourceConflicts(
        "mentor-1",
        "ws-new",
        baseDate,
        baseTime,
        baseDuration,
        null,
        false
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.hasConflict).toBe(true);
        expect(result.data.conflictMessage).toContain("Existing Workshop");
      }
    });

    it("detects location conflict for non-virtual workshops", async () => {
      mockWorkshopRepo.findByCreatorId.mockResolvedValue([]);
      mockWorkshopRepo.findPublished.mockResolvedValue([
        {
          id: "ws-other",
          title: "Other Workshop",
          status: "PUBLISHED",
          date: new Date("2025-06-15"),
          time: "14:00",
          duration: 60,
          isVirtual: false,
          location: "Room A",
        },
      ]);

      const result = await checker.checkResourceConflicts(
        "mentor-1",
        "ws-new",
        baseDate,
        baseTime,
        baseDuration,
        "Room A",
        false
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.hasConflict).toBe(true);
        expect(result.data.conflictMessage).toContain("Room A");
      }
    });

    it("returns no conflict when times don't overlap", async () => {
      mockWorkshopRepo.findByCreatorId.mockResolvedValue([
        {
          id: "ws-existing",
          title: "Morning Workshop",
          status: "CONFIRMED",
          date: new Date("2025-06-15"),
          time: "08:00",
          duration: 60,
        },
      ]);
      mockWorkshopRepo.findPublished.mockResolvedValue([]);

      const result = await checker.checkResourceConflicts(
        "mentor-1",
        "ws-new",
        baseDate,
        baseTime,
        baseDuration,
        null,
        false
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.hasConflict).toBe(false);
      }
    });

    it("skips location check for virtual workshops", async () => {
      mockWorkshopRepo.findByCreatorId.mockResolvedValue([]);

      const result = await checker.checkResourceConflicts(
        "mentor-1",
        "ws-new",
        baseDate,
        baseTime,
        baseDuration,
        "Room A",
        true
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.hasConflict).toBe(false);
      }
      expect(mockWorkshopRepo.findPublished).not.toHaveBeenCalled();
    });

    it("skips the same workshop (excludeId)", async () => {
      mockWorkshopRepo.findByCreatorId.mockResolvedValue([
        {
          id: "ws-new",
          title: "Same Workshop",
          status: "CONFIRMED",
          date: new Date("2025-06-15"),
          time: "14:00",
          duration: 60,
        },
      ]);
      mockWorkshopRepo.findPublished.mockResolvedValue([]);

      const result = await checker.checkResourceConflicts(
        "mentor-1",
        "ws-new",
        baseDate,
        baseTime,
        baseDuration,
        null,
        false
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.hasConflict).toBe(false);
      }
    });

    it("skips workshops with CANCELLED status", async () => {
      mockWorkshopRepo.findByCreatorId.mockResolvedValue([
        {
          id: "ws-cancelled",
          title: "Cancelled Workshop",
          status: "CANCELLED",
          date: new Date("2025-06-15"),
          time: "14:00",
          duration: 60,
        },
      ]);
      mockWorkshopRepo.findPublished.mockResolvedValue([]);

      const result = await checker.checkResourceConflicts(
        "mentor-1",
        "ws-new",
        baseDate,
        baseTime,
        baseDuration,
        null,
        false
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.hasConflict).toBe(false);
      }
    });

    it("ignores location conflict for virtual published workshops", async () => {
      mockWorkshopRepo.findByCreatorId.mockResolvedValue([]);
      mockWorkshopRepo.findPublished.mockResolvedValue([
        {
          id: "ws-virtual",
          title: "Virtual Workshop",
          status: "PUBLISHED",
          date: new Date("2025-06-15"),
          time: "14:00",
          duration: 60,
          isVirtual: true,
          location: "Room A",
        },
      ]);

      const result = await checker.checkResourceConflicts(
        "mentor-1",
        "ws-new",
        baseDate,
        baseTime,
        baseDuration,
        "Room A",
        false
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.hasConflict).toBe(false);
      }
    });
  });
});
