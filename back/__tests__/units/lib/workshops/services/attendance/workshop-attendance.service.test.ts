import { describe, it, expect, vi, beforeEach } from "vitest";
import { success, failure } from "@/lib/common/types";
import { WorkshopAttendanceService } from "@/lib/workshops/services/attendance/workshop-attendance.service";

// Mock logger to avoid noise and potential errors
vi.mock("@/lib/common/logger", () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

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
  const mockWorkshopCashbackService = {
    processCashback: vi.fn(),
  };
  const mockNoShowPenaltyService = {
    applyPenalty: vi.fn(),
  };
  const mockPrisma = {
    workshop: {
      update: vi.fn(),
    },
  };

  let service: WorkshopAttendanceService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new WorkshopAttendanceService(
      mockWorkshopService as any,
      mockWorkshopRepo as any,
      mockUserTitleService as any,
      mockWorkshopCashbackService as any,
      mockNoShowPenaltyService as any,
      mockPrisma as any
    );
  });

  describe("getWorkshopParticipants", () => {
    it("returns failure when workshop not found", async () => {
      mockWorkshopService.getWorkshopById.mockResolvedValue(failure("Not found"));
      const result = await service.getWorkshopParticipants("user-1", "ws-1");
      expect(result.ok).toBe(false);
    });

    it("returns 403 when user is not the creator", async () => {
      mockWorkshopService.getWorkshopById.mockResolvedValue(
        success({ id: "ws-1", creatorId: "other-user" } as any)
      );
      const result = await service.getWorkshopParticipants("user-1", "ws-1");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(403);
    });

    it("returns empty participants when no apprentice", async () => {
      mockWorkshopService.getWorkshopById.mockResolvedValue(
        success({ id: "ws-1", creatorId: "user-1", apprenticeId: null } as any)
      );
      const result = await service.getWorkshopParticipants("user-1", "ws-1");
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.data.participants).toHaveLength(0);
    });

    it("returns participants when apprentice exists", async () => {
      mockWorkshopService.getWorkshopById.mockResolvedValue(
        success({
          id: "ws-1",
          creatorId: "user-1",
          apprenticeId: "app-1",
          apprentice: {
            userId: "user-app-1",
            name: "John",
            email: "john@example.com",
            title: "Explorer",
          },
          apprenticeAttendanceStatus: "PENDING",
        } as any)
      );
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
      mockWorkshopService.getWorkshopById.mockResolvedValue(
        success({ id: "ws-1", creatorId: "other-user" } as any)
      );
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
      mockWorkshopService.getWorkshopById.mockResolvedValue(
        success({
          id: "ws-1",
          creatorId: "user-1",
          apprenticeId: "app-1",
          apprentice: { userId: "other-part" },
        } as any)
      );
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
      const workshopDate = new Date(2025, 0, 1); // 1st Jan 2025 local
      const fakeNow = new Date(2025, 0, 1, 10, 30); // 10:30 Jan 1st local
      
      mockWorkshopService.getWorkshopById.mockResolvedValue(
        success({
          id: "ws-1",
          creatorId: "user-1",
          apprenticeId: "app-1",
          apprentice: { userId: "part-1" },
          date: workshopDate,
          time: "10:00",
          duration: 60, // Ends at 11:00
        } as any)
      );

      vi.useFakeTimers();
      vi.setSystemTime(fakeNow);

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
      const pastDate = new Date(2020, 0, 1);
      mockWorkshopService.getWorkshopById.mockResolvedValue(
        success({
          id: "ws-1",
          creatorId: "user-1",
          apprenticeId: "app-1",
          apprentice: { userId: "part-1" },
          date: pastDate,
          time: "10:00",
          duration: 60,
          apprenticeAttendanceStatus: "PENDING",
        } as any)
      );
      mockUserTitleService.updateTitleBasedOnWorkshops.mockResolvedValue(
        success({ titleChanged: false })
      );
      mockWorkshopCashbackService.processCashback.mockResolvedValue(success({}));

      const result = await service.updateAttendance(
        "user-1",
        "ws-1",
        "part-1",
        "PRESENT"
      );
      expect(result.ok).toBe(true);
      expect(mockPrisma.workshop.update).toHaveBeenCalledWith({
        where: { id: "ws-1" },
        data: { apprenticeAttendanceStatus: "PRESENT" },
      });
      expect(mockWorkshopCashbackService.processCashback).toHaveBeenCalled();
    });
  });

  describe("confirmAttendance", () => {
    it("returns 403 when user is not the creator", async () => {
      mockWorkshopService.getWorkshopById.mockResolvedValue(
        success({ id: "ws-1", creatorId: "other-user" } as any)
      );
      const result = await service.confirmAttendance("user-1", "ws-1");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(403);
    });

    it("returns error when workshop has no date/time/duration", async () => {
      mockWorkshopService.getWorkshopById.mockResolvedValue(
        success({ id: "ws-1", creatorId: "user-1", date: null } as any)
      );
      const result = await service.confirmAttendance("user-1", "ws-1");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(400);
    });

    it("returns error when workshop is not yet finished", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      mockWorkshopService.getWorkshopById.mockResolvedValue(
        success({
          id: "ws-1",
          creatorId: "user-1",
          date: futureDate,
          time: "10:00",
          duration: 60,
        } as any)
      );
      const result = await service.confirmAttendance("user-1", "ws-1");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(400);
    });

    it("applies no-show penalty when apprentice is PENDING", async () => {
      const pastDate = new Date(2020, 0, 1);
      mockWorkshopService.getWorkshopById.mockResolvedValue(
        success({
          id: "ws-1",
          creatorId: "user-1",
          apprenticeId: "app-1",
          apprentice: { userId: "part-1" },
          apprenticeAttendanceStatus: "PENDING",
          date: pastDate,
          time: "10:00",
          duration: 60,
        } as any)
      );
      mockNoShowPenaltyService.applyPenalty.mockResolvedValue(success({ penaltyApplied: true }));

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
    });

    it("marks workshop as COMPLETED on success", async () => {
      const pastDate = new Date(2020, 0, 1);
      mockWorkshopService.getWorkshopById.mockResolvedValue(
        success({
          id: "ws-1",
          creatorId: "user-1",
          date: pastDate,
          time: "10:00",
          duration: 60,
        } as any)
      );
      mockWorkshopRepo.update.mockResolvedValue({ status: "COMPLETED" });

      const result = await service.confirmAttendance("user-1", "ws-1");
      expect(result.ok).toBe(true);
      expect(mockWorkshopRepo.update).toHaveBeenCalledWith("ws-1", {
        status: "COMPLETED",
      });
    });
  });
});
