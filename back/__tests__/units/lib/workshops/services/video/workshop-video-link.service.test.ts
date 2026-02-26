import { describe, it, expect, vi, beforeEach } from "vitest";
import { WorkshopVideoLinkService } from "../../../../../../src/lib/workshops/services/video/workshop-video-link.service";
import type { WorkshopEntity } from "../../../../../../src/lib/workshops/repositories/workshop.repository.interface";

describe("WorkshopVideoLinkService", () => {
  const mockWorkshopRepo = {
    findPublished: vi.fn(),
  };

  let service: WorkshopVideoLinkService;

  const createWorkshop = (overrides: Partial<WorkshopEntity> = {}): WorkshopEntity => ({
    id: "ws-1",
    title: "Test Workshop",
    description: null,
    topic: null,
    date: new Date("2025-06-15"),
    time: "14:00",
    duration: 60,
    location: null,
    isVirtual: true,
    maxParticipants: null,
    materialsNeeded: null,
    status: "PUBLISHED",
    creatorId: "creator-1",
    apprenticeId: null,
    requestId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: new Date(),
    dailyRoomId: null,
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    service = new WorkshopVideoLinkService(mockWorkshopRepo as any);
  });

  describe("shouldGenerateLink", () => {
    it("returns false for non-virtual workshop", () => {
      const workshop = createWorkshop({ isVirtual: false });
      expect(service.shouldGenerateLink(workshop)).toBe(false);
    });

    it("returns false when date is missing", () => {
      const workshop = createWorkshop({ date: null });
      expect(service.shouldGenerateLink(workshop)).toBe(false);
    });

    it("returns false when time is missing", () => {
      const workshop = createWorkshop({ time: null });
      expect(service.shouldGenerateLink(workshop)).toBe(false);
    });

    it("returns true when workshop is ~12h away (within ±30min window)", () => {
      const workshopDate = new Date("2025-06-15");
      const workshop = createWorkshop({ date: workshopDate, time: "14:00" });

      const startTime = new Date("2025-06-15T14:00:00");
      const twelveHoursBefore = new Date(startTime.getTime() - 12 * 60 * 60 * 1000);

      expect(service.shouldGenerateLink(workshop, twelveHoursBefore)).toBe(true);
    });

    it("returns false when workshop is more than 12.5h away", () => {
      const workshopDate = new Date("2025-06-15");
      const workshop = createWorkshop({ date: workshopDate, time: "14:00" });

      const startTime = new Date("2025-06-15T14:00:00");
      const tooEarly = new Date(startTime.getTime() - 13 * 60 * 60 * 1000);

      expect(service.shouldGenerateLink(workshop, tooEarly)).toBe(false);
    });

    it("returns false when workshop is less than 11.5h away", () => {
      const workshopDate = new Date("2025-06-15");
      const workshop = createWorkshop({ date: workshopDate, time: "14:00" });

      const startTime = new Date("2025-06-15T14:00:00");
      const tooLate = new Date(startTime.getTime() - 11 * 60 * 60 * 1000);

      expect(service.shouldGenerateLink(workshop, tooLate)).toBe(false);
    });
  });

  describe("shouldExposeLink", () => {
    it("returns false for non-virtual workshop", () => {
      const workshop = createWorkshop({ isVirtual: false });
      expect(service.shouldExposeLink(workshop)).toBe(false);
    });

    it("returns false when date is missing", () => {
      const workshop = createWorkshop({ date: null });
      expect(service.shouldExposeLink(workshop)).toBe(false);
    });

    it("returns true when workshop starts within 3 hours", () => {
      const workshopDate = new Date("2025-06-15");
      const workshop = createWorkshop({ date: workshopDate, time: "14:00" });

      const startTime = new Date("2025-06-15T14:00:00");
      const twoHoursBefore = new Date(startTime.getTime() - 2 * 60 * 60 * 1000);

      expect(service.shouldExposeLink(workshop, twoHoursBefore)).toBe(true);
    });

    it("returns true when workshop has already started", () => {
      const workshopDate = new Date("2025-06-15");
      const workshop = createWorkshop({ date: workshopDate, time: "14:00" });

      const afterStart = new Date("2025-06-15T15:00:00");
      expect(service.shouldExposeLink(workshop, afterStart)).toBe(true);
    });

    it("returns false when workshop is more than 3 hours away", () => {
      const workshopDate = new Date("2025-06-15");
      const workshop = createWorkshop({ date: workshopDate, time: "14:00" });

      const startTime = new Date("2025-06-15T14:00:00");
      const fourHoursBefore = new Date(startTime.getTime() - 4 * 60 * 60 * 1000);

      expect(service.shouldExposeLink(workshop, fourHoursBefore)).toBe(false);
    });
  });

  describe("findWorkshopsEligibleForLinkGeneration", () => {
    it("filters out non-virtual workshops", async () => {
      mockWorkshopRepo.findPublished.mockResolvedValue([
        createWorkshop({ isVirtual: false }),
      ]);

      const result = await service.findWorkshopsEligibleForLinkGeneration();
      expect(result).toHaveLength(0);
    });

    it("filters out workshops with missing date/time", async () => {
      mockWorkshopRepo.findPublished.mockResolvedValue([
        createWorkshop({ date: null }),
        createWorkshop({ time: null }),
      ]);

      const result = await service.findWorkshopsEligibleForLinkGeneration();
      expect(result).toHaveLength(0);
    });

    it("filters out workshops that already have a dailyRoomId", async () => {
      mockWorkshopRepo.findPublished.mockResolvedValue([
        createWorkshop({ dailyRoomId: "existing-room" }),
      ]);

      const result = await service.findWorkshopsEligibleForLinkGeneration();
      expect(result).toHaveLength(0);
    });
  });

  describe("filterVideoLink", () => {
    it("preserves dailyRoomId when link should be exposed", () => {
      const workshopDate = new Date("2025-06-15");
      const workshop = createWorkshop({
        date: workshopDate,
        time: "14:00",
        dailyRoomId: "room-123",
      });

      const startTime = new Date("2025-06-15T14:00:00");
      const withinWindow = new Date(startTime.getTime() - 1 * 60 * 60 * 1000);

      vi.useFakeTimers();
      vi.setSystemTime(withinWindow);

      const result = service.filterVideoLink(workshop);
      expect(result.dailyRoomId).toBe("room-123");

      vi.useRealTimers();
    });

    it("nullifies dailyRoomId when link should not be exposed", () => {
      const workshopDate = new Date("2025-06-15");
      const workshop = createWorkshop({
        date: workshopDate,
        time: "14:00",
        dailyRoomId: "room-123",
      });

      const startTime = new Date("2025-06-15T14:00:00");
      const tooEarly = new Date(startTime.getTime() - 5 * 60 * 60 * 1000);

      vi.useFakeTimers();
      vi.setSystemTime(tooEarly);

      const result = service.filterVideoLink(workshop);
      expect(result.dailyRoomId).toBeNull();

      vi.useRealTimers();
    });

    it("returns a new object without mutating the original", () => {
      const workshop = createWorkshop({ dailyRoomId: "room-123", isVirtual: false });

      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-06-15T10:00:00"));

      const result = service.filterVideoLink(workshop);
      expect(result).not.toBe(workshop);
      expect(workshop.dailyRoomId).toBe("room-123");

      vi.useRealTimers();
    });
  });
});
