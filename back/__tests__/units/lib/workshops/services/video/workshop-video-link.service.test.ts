import { describe, it, expect, vi, beforeEach } from "vitest";
import { WorkshopVideoLinkService } from "../../../../../../src/lib/workshops/services/video/workshop-video-link.service";
import type { WorkshopEntity } from "../../../../../../src/lib/workshops/repositories/workshop.repository.interface";

describe("WorkshopVideoLinkService", () => {
  const mockWorkshopRepo = {
    findPublished: vi.fn(),
  };

  let service: WorkshopVideoLinkService;

  const createWorkshop = (
    overrides: Partial<WorkshopEntity> = {},
  ): WorkshopEntity => ({
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

  const createWorkshopAt14h = (
    overrides: Partial<WorkshopEntity> = {},
  ): WorkshopEntity =>
    createWorkshop({
      date: new Date("2025-06-15"),
      time: "14:00",
      ...overrides,
    });

  const startTime14h = new Date("2025-06-15T14:00:00");
  const hoursBeforeStart = (hours: number) =>
    new Date(startTime14h.getTime() - hours * 60 * 60 * 1000);

  const withFakeTimers = (systemTime: Date, fn: () => void) => {
    vi.useFakeTimers();
    vi.setSystemTime(systemTime);
    try {
      fn();
    } finally {
      vi.useRealTimers();
    }
  };

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
      const workshop = createWorkshopAt14h();
      expect(service.shouldGenerateLink(workshop, hoursBeforeStart(12))).toBe(
        true,
      );
    });

    it("returns false when workshop is more than 12.5h away", () => {
      const workshop = createWorkshopAt14h();
      expect(service.shouldGenerateLink(workshop, hoursBeforeStart(13))).toBe(
        false,
      );
    });

    it("returns false when workshop is less than 11.5h away", () => {
      const workshop = createWorkshopAt14h();
      expect(service.shouldGenerateLink(workshop, hoursBeforeStart(11))).toBe(
        false,
      );
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
      withFakeTimers(new Date("2025-06-15T12:00:00"), () => {
        const workshop = createWorkshopAt14h();
        expect(service.shouldExposeLink(workshop)).toBe(true);
      });
    });

    it("returns true when workshop has already started", () => {
      withFakeTimers(new Date("2025-06-15T15:00:00"), () => {
        const workshop = createWorkshopAt14h();
        expect(service.shouldExposeLink(workshop)).toBe(true);
      });
    });

    it("returns false when workshop is more than 3 hours away", () => {
      withFakeTimers(new Date("2025-06-15T10:00:00"), () => {
        const workshop = createWorkshopAt14h();
        expect(service.shouldExposeLink(workshop)).toBe(false);
      });
    });
  });

  const expectNoEligibleWorkshops = async (workshops: WorkshopEntity[]) => {
    mockWorkshopRepo.findPublished.mockResolvedValue(workshops);
    const result = await service.findWorkshopsEligibleForLinkGeneration();
    expect(result).toHaveLength(0);
  };

  describe("findWorkshopsEligibleForLinkGeneration", () => {
    it("filters out non-virtual workshops", async () => {
      await expectNoEligibleWorkshops([createWorkshop({ isVirtual: false })]);
    });

    it("filters out workshops with missing date/time", async () => {
      await expectNoEligibleWorkshops([
        createWorkshop({ date: null }),
        createWorkshop({ time: null }),
      ]);
    });

    it("filters out workshops that already have a dailyRoomId", async () => {
      await expectNoEligibleWorkshops([
        createWorkshop({ dailyRoomId: "existing-room" }),
      ]);
    });
  });

  describe("filterVideoLink", () => {
    it("preserves dailyRoomId when link should be exposed", () => {
      const workshop = createWorkshopAt14h({ dailyRoomId: "room-123" });
      withFakeTimers(hoursBeforeStart(1), () => {
        const result = service.filterVideoLink(workshop);
        expect(result.dailyRoomId).toBe("room-123");
      });
    });

    it("nullifies dailyRoomId when link should not be exposed", () => {
      const workshop = createWorkshopAt14h({ dailyRoomId: "room-123" });
      withFakeTimers(hoursBeforeStart(5), () => {
        const result = service.filterVideoLink(workshop);
        expect(result.dailyRoomId).toBeNull();
      });
    });

    it("returns a new object without mutating the original", () => {
      const workshop = createWorkshop({
        dailyRoomId: "room-123",
        isVirtual: false,
      });
      withFakeTimers(new Date("2025-06-15T10:00:00"), () => {
        const result = service.filterVideoLink(workshop);
        expect(result).not.toBe(workshop);
        expect(workshop.dailyRoomId).toBe("room-123");
      });
    });
  });
});
