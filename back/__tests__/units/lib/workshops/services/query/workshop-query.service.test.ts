import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../../../../src/lib/common/prisma", () => ({ prisma: {} }));
vi.mock("../../../../../../src/lib/common/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import {
  WorkshopQueryService,
  WorkshopApprenticeQueryService,
} from "../../../../../../src/lib/workshops/services/query/workshop-query.service";

describe("WorkshopQueryService", () => {
  const mockWorkshopRepo = {
    findById: vi.fn(),
    findByCreatorId: vi.fn(),
    findPublished: vi.fn(),
    findByApprenticeId: vi.fn(),
  };

  const mockAccessGuard = {
    verifyMentorAccess: vi.fn(),
    verifyApprenticeAccess: vi.fn(),
  };

  const mockVideoLinkService = {
    filterVideoLink: vi.fn(),
  };

  let service: WorkshopQueryService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new WorkshopQueryService(
      mockWorkshopRepo as any,
      mockAccessGuard as any,
      mockVideoLinkService as any
    );
  });

  describe("getWorkshopsByCreator", () => {
    it("returns failure when access check fails", async () => {
      mockAccessGuard.verifyMentorAccess.mockResolvedValue({
        ok: false,
        error: "Not a mentor",
        status: 403,
      });

      const result = await service.getWorkshopsByCreator("user-1");
      expect(result.ok).toBe(false);
    });

    it("returns failure when appUser is null", async () => {
      mockAccessGuard.verifyMentorAccess.mockResolvedValue({
        ok: true,
        data: { appUser: null },
      });

      const result = await service.getWorkshopsByCreator("user-1");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(404);
    });

    it("returns workshops for the creator", async () => {
      const workshops = [{ id: "ws-1" }, { id: "ws-2" }];
      mockAccessGuard.verifyMentorAccess.mockResolvedValue({
        ok: true,
        data: { appUser: { id: "app-1" } },
      });
      mockWorkshopRepo.findByCreatorId.mockResolvedValue(workshops);

      const result = await service.getWorkshopsByCreator("user-1");
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.data).toHaveLength(2);
    });
  });

  describe("getPublishedWorkshops", () => {
    it("returns all published workshops", async () => {
      const workshops = [{ id: "ws-1" }];
      mockWorkshopRepo.findPublished.mockResolvedValue(workshops);

      const result = await service.getPublishedWorkshops();
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.data).toEqual(workshops);
    });
  });

  describe("getWorkshopById", () => {
    it("returns failure when workshop not found", async () => {
      mockWorkshopRepo.findById.mockResolvedValue(null);

      const result = await service.getWorkshopById("ws-1");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(404);
    });

    it("returns workshop with filtered video link", async () => {
      const workshop = { id: "ws-1", dailyRoomId: "room-1" };
      const filtered = { id: "ws-1", dailyRoomId: null };
      mockWorkshopRepo.findById.mockResolvedValue(workshop);
      mockVideoLinkService.filterVideoLink.mockReturnValue(filtered);

      const result = await service.getWorkshopById("ws-1");
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.data).toEqual(filtered);
      expect(mockVideoLinkService.filterVideoLink).toHaveBeenCalledWith(workshop);
    });
  });
});

describe("WorkshopApprenticeQueryService", () => {
  const mockWorkshopRepo = {
    findByApprenticeId: vi.fn(),
    findPublished: vi.fn(),
  };

  const mockAccessGuard = {
    verifyApprenticeAccess: vi.fn(),
  };

  const mockRequestRepo = {
    findByApprenticeId: vi.fn(),
  };

  const mockUserBlockService = {
    getAllBlockedAppUserIds: vi.fn().mockResolvedValue({
      ok: true,
      data: { blockedByUser: [], blockedUser: [] },
    }),
  };

  let service: WorkshopApprenticeQueryService;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    service = new WorkshopApprenticeQueryService(
      mockWorkshopRepo as any,
      mockAccessGuard as any,
      mockUserBlockService as any,
      mockRequestRepo as any
    );
  });

  describe("getConfirmedWorkshopsForApprentice", () => {
    it("returns failure when access check fails", async () => {
      mockAccessGuard.verifyApprenticeAccess.mockResolvedValue({
        ok: false,
        error: "Not an apprentice",
        status: 403,
      });

      const result = await service.getConfirmedWorkshopsForApprentice("user-1");
      expect(result.ok).toBe(false);
    });

    it("filters to only confirmed workshops (with date, time, and not cancelled)", async () => {
      mockAccessGuard.verifyApprenticeAccess.mockResolvedValue({
        ok: true,
        data: { appUser: { id: "app-1" } },
      });
      mockWorkshopRepo.findByApprenticeId.mockResolvedValue([
        { id: "ws-1", date: new Date(), time: "14:00", status: "PUBLISHED" },
        { id: "ws-2", date: null, time: null, status: "PUBLISHED" },
        { id: "ws-3", date: new Date(), time: "15:00", status: "CANCELLED" },
      ]);

      const result = await service.getConfirmedWorkshopsForApprentice("user-1");
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.data).toHaveLength(1);
    });
  });

  describe("getUpcomingWorkshopsForApprentice", () => {
    it("returns only future workshops sorted by date", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-06-15T12:00:00Z"));

      mockAccessGuard.verifyApprenticeAccess.mockResolvedValue({
        ok: true,
        data: { appUser: { id: "app-1" } },
      });
      mockWorkshopRepo.findByApprenticeId.mockResolvedValue([
        {
          id: "ws-past",
          date: new Date("2025-06-10"),
          time: "10:00",
          duration: 60,
          status: "PUBLISHED",
          createdAt: new Date("2025-06-01"),
        },
        {
          id: "ws-future",
          date: new Date("2025-06-20"),
          time: "14:00",
          duration: 60,
          status: "PUBLISHED",
          createdAt: new Date("2025-06-02"),
        },
        {
          id: "ws-cancelled",
          date: new Date("2025-06-25"),
          time: "10:00",
          duration: 60,
          status: "CANCELLED",
          createdAt: new Date("2025-06-03"),
        },
      ]);

      const result = await service.getUpcomingWorkshopsForApprentice("user-1");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0].id).toBe("ws-future");
      }

      vi.useRealTimers();
    });
  });

  describe("getWorkshopHistoryForApprentice", () => {
    it("returns only past workshops sorted by date descending", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-06-15T12:00:00Z"));

      mockAccessGuard.verifyApprenticeAccess.mockResolvedValue({
        ok: true,
        data: { appUser: { id: "app-1" } },
      });
      mockWorkshopRepo.findByApprenticeId.mockResolvedValue([
        {
          id: "ws-1",
          date: new Date("2025-06-01"),
          time: "10:00",
          duration: 60,
          status: "COMPLETED",
        },
        {
          id: "ws-2",
          date: new Date("2025-06-10"),
          time: "14:00",
          duration: 60,
          status: "COMPLETED",
        },
        {
          id: "ws-future",
          date: new Date("2025-06-20"),
          time: "14:00",
          duration: 60,
          status: "PUBLISHED",
        },
      ]);

      const result = await service.getWorkshopHistoryForApprentice("user-1");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toHaveLength(2);
        expect(result.data[0].id).toBe("ws-2");
        expect(result.data[1].id).toBe("ws-1");
      }

      vi.useRealTimers();
    });
  });

  describe("getAvailableWorkshopsForApprentice", () => {
    it("excludes registered and pending-request workshops", async () => {
      mockAccessGuard.verifyApprenticeAccess.mockResolvedValue({
        ok: true,
        data: { appUser: { id: "app-1" } },
      });
      mockWorkshopRepo.findPublished.mockResolvedValue([
        { id: "ws-available", status: "PUBLISHED", apprenticeId: null },
        { id: "ws-registered", status: "PUBLISHED", apprenticeId: null },
        { id: "ws-pending", status: "PUBLISHED", apprenticeId: null },
        { id: "ws-taken", status: "PUBLISHED", apprenticeId: "other-app" },
      ]);
      mockWorkshopRepo.findByApprenticeId.mockResolvedValue([
        { id: "ws-registered" },
      ]);
      mockRequestRepo.findByApprenticeId.mockResolvedValue([
        { workshopId: "ws-pending", status: "PENDING" },
      ]);

      const result = await service.getAvailableWorkshopsForApprentice("user-1");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0].id).toBe("ws-available");
      }
      });

      it("filters out workshops from blocked mentors", async () => {
      mockAccessGuard.verifyApprenticeAccess.mockResolvedValue({
        ok: true,
        data: { appUser: { id: "app-1" } },
      });
      mockWorkshopRepo.findPublished.mockResolvedValue([
        { id: "ws-blocked", status: "PUBLISHED", apprenticeId: null, creatorId: "blocked-mentor" },
        { id: "ws-ok", status: "PUBLISHED", apprenticeId: null, creatorId: "ok-mentor" },
      ]);
      mockWorkshopRepo.findByApprenticeId.mockResolvedValue([]);
      mockRequestRepo.findByApprenticeId.mockResolvedValue([]);
      mockUserBlockService.getAllBlockedAppUserIds.mockResolvedValue({
        ok: true,
        data: { blockedByUser: ["blocked-mentor"], blockedUser: [] },
      });

      const result = await service.getAvailableWorkshopsForApprentice("user-1");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0].id).toBe("ws-ok");
      }
      });
      });
      });
