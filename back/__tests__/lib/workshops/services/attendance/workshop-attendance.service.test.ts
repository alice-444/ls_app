import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../../../src/lib/common/prisma", () => ({ prisma: {} }));
vi.mock("../../../../../src/lib/common/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { WorkshopAttendanceService } from "../../../../../src/lib/workshops/services/attendance/workshop-attendance.service";

describe("WorkshopAttendanceService", () => {
  const mockWorkshopService = {
    getWorkshopById: vi.fn(),
  };

  const mockWorkshopRepo = {
    update: vi.fn(),
  };

  const mockUserTitleService = {
    updateTitleBasedOnWorkshops: vi.fn(),
  };

  const mockCashbackService = {
    processCashback: vi.fn(),
  };

  const mockNoShowPenaltyService = {
    applyPenalty: vi.fn(),
  };

  const mockPrisma = {
    user: { findUnique: vi.fn() },
    workshop: { update: vi.fn() },
  };

  let service: WorkshopAttendanceService;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    service = new WorkshopAttendanceService(
      mockWorkshopService as any,
      mockWorkshopRepo as any,
      mockUserTitleService as any,
      mockCashbackService as any,
      mockNoShowPenaltyService as any,
      mockPrisma as any
    );
  });

  describe("getWorkshopParticipants", () => {
    it("returns failure when workshop not found", async () => {
      mockWorkshopService.getWorkshopById.mockResolvedValue({
        ok: false,
        error: "Not found",
        status: 404,
      });

      const result = await service.getWorkshopParticipants("user-1", "ws-1");
      expect(result.ok).toBe(false);
    });

    it("returns 403 when user is not the creator", async () => {
      mockWorkshopService.getWorkshopById.mockResolvedValue({
        ok: true,
        data: { creatorId: "other-user" },
      });

      const result = await service.getWorkshopParticipants("user-1", "ws-1");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(403);
    });

    it("returns empty participants when no apprentice", async () => {
      mockWorkshopService.getWorkshopById.mockResolvedValue({
        ok: true,
        data: {
          creatorId: "user-1",
          apprenticeId: null,
          apprentice: null,
        },
      });

      const result = await service.getWorkshopParticipants("user-1", "ws-1");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.participants).toHaveLength(0);
      }
    });

    it("returns participants when apprentice exists", async () => {
      mockWorkshopService.getWorkshopById.mockResolvedValue({
        ok: true,
        data: {
          creatorId: "user-1",
          apprenticeId: "app-1",
          apprentice: {
            user: { id: "participant-1", name: "John", email: "j@t.com" },
          },
          apprenticeAttendanceStatus: "PENDING",
        },
      });
      mockPrisma.user.findUnique.mockResolvedValue({ title: "Explorer" });

      const result = await service.getWorkshopParticipants("user-1", "ws-1");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.participants).toHaveLength(1);
        expect(result.data.participants[0].name).toBe("John");
        expect(result.data.participants[0].attendanceStatus).toBe("PENDING");
      }
    });
  });

  describe("updateAttendance", () => {
    it("returns 403 when user is not the creator", async () => {
      mockWorkshopService.getWorkshopById.mockResolvedValue({
        ok: true,
        data: { creatorId: "other-user" },
      });

      const result = await service.updateAttendance(
        "user-1",
        "ws-1",
        "part-1",
        "PRESENT"
      );
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(403);
    });

    it("returns 404 when participant not found", async () => {
      mockWorkshopService.getWorkshopById.mockResolvedValue({
        ok: true,
        data: {
          creatorId: "user-1",
          apprenticeId: null,
          apprentice: null,
        },
      });

      const result = await service.updateAttendance(
        "user-1",
        "ws-1",
        "part-1",
        "PRESENT"
      );
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(404);
    });

    it("returns error when marking PRESENT before workshop end", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-06-01T10:00:00Z"));

      mockWorkshopService.getWorkshopById.mockResolvedValue({
        ok: true,
        data: {
          creatorId: "user-1",
          apprenticeId: "app-1",
          apprentice: { user: { id: "part-1" } },
          date: new Date("2025-06-15"),
          time: "14:00",
          duration: 120,
          apprenticeAttendanceStatus: "PENDING",
        },
      });

      const result = await service.updateAttendance(
        "user-1",
        "ws-1",
        "part-1",
        "PRESENT"
      );
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(400);

      vi.useRealTimers();
    });

    it("succeeds and processes cashback when marking PRESENT after end", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-06-01T15:00:00Z"));

      mockWorkshopService.getWorkshopById.mockResolvedValue({
        ok: true,
        data: {
          creatorId: "user-1",
          apprenticeId: "app-1",
          apprentice: { user: { id: "part-1" } },
          date: new Date("2025-06-01"),
          time: "10:00",
          duration: 60,
          apprenticeAttendanceStatus: "PENDING",
        },
      });
      mockPrisma.workshop.update.mockResolvedValue({});
      mockUserTitleService.updateTitleBasedOnWorkshops.mockResolvedValue({
        ok: true,
        data: { titleChanged: true, newTitle: "Challenger" },
      });
      mockCashbackService.processCashback.mockResolvedValue({ ok: true });

      const result = await service.updateAttendance(
        "user-1",
        "ws-1",
        "part-1",
        "PRESENT"
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.success).toBe(true);
        expect(result.data.titleChanged).toBe(true);
        expect(result.data.newTitle).toBe("Challenger");
      }
      expect(mockCashbackService.processCashback).toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe("confirmAttendance", () => {
    it("returns 403 when user is not the creator", async () => {
      mockWorkshopService.getWorkshopById.mockResolvedValue({
        ok: true,
        data: { creatorId: "other-user" },
      });

      const result = await service.confirmAttendance("user-1", "ws-1");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(403);
    });

    it("returns error when workshop has no date/time/duration", async () => {
      mockWorkshopService.getWorkshopById.mockResolvedValue({
        ok: true,
        data: {
          creatorId: "user-1",
          date: null,
          time: null,
          duration: null,
        },
      });

      const result = await service.confirmAttendance("user-1", "ws-1");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(400);
    });

    it("returns error when workshop is not yet finished", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-06-01T10:00:00Z"));

      mockWorkshopService.getWorkshopById.mockResolvedValue({
        ok: true,
        data: {
          creatorId: "user-1",
          date: new Date("2025-06-15"),
          time: "14:00",
          duration: 60,
        },
      });

      const result = await service.confirmAttendance("user-1", "ws-1");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(400);

      vi.useRealTimers();
    });

    it("applies no-show penalty when apprentice is PENDING", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-06-01T15:00:00Z"));

      mockWorkshopService.getWorkshopById.mockResolvedValue({
        ok: true,
        data: {
          creatorId: "user-1",
          date: new Date("2025-06-01"),
          time: "10:00",
          duration: 60,
          apprenticeId: "app-1",
          apprentice: { user: { id: "part-1" } },
          apprenticeAttendanceStatus: "PENDING",
        },
      });
      mockWorkshopRepo.update.mockResolvedValue({});
      mockNoShowPenaltyService.applyPenalty.mockResolvedValue({ ok: true });

      const result = await service.confirmAttendance("user-1", "ws-1");
      expect(result.ok).toBe(true);
      expect(mockWorkshopRepo.update).toHaveBeenCalledWith(
        "ws-1",
        expect.objectContaining({ apprenticeAttendanceStatus: "NO_SHOW" })
      );
      expect(mockNoShowPenaltyService.applyPenalty).toHaveBeenCalledWith(
        "ws-1",
        "part-1"
      );

      vi.useRealTimers();
    });

    it("marks workshop as COMPLETED on success", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-06-01T15:00:00Z"));

      mockWorkshopService.getWorkshopById.mockResolvedValue({
        ok: true,
        data: {
          creatorId: "user-1",
          date: new Date("2025-06-01"),
          time: "10:00",
          duration: 60,
          apprenticeId: null,
          apprentice: null,
          apprenticeAttendanceStatus: null,
        },
      });
      mockWorkshopRepo.update.mockResolvedValue({});

      const result = await service.confirmAttendance("user-1", "ws-1");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.message).toBe("Attendance confirmed");
      }
      expect(mockWorkshopRepo.update).toHaveBeenCalledWith("ws-1", {
        status: "COMPLETED",
      });

      vi.useRealTimers();
    });
  });
});
