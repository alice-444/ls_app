import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../../../src/lib/common/prisma", () => ({ prisma: {} }));
vi.mock("../../../../../src/lib/common/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));
vi.mock("../../../../../src/lib/utils/id-generator", () => ({
  generateInternalId: () => "generated-id",
}));

import { WorkshopCashbackService } from "../../../../../src/lib/workshops/services/rewards/workshop-cashback.service";

describe("WorkshopCashbackService", () => {
  const mockWorkshopRepo = {
    findById: vi.fn(),
    findByCreatorId: vi.fn(),
    findPublished: vi.fn(),
    findByApprenticeId: vi.fn(),
    update: vi.fn(),
  };

  const mockAppUserRepo = {
    findByUserId: vi.fn(),
  };

  const mockCreditTransactionRepo = {
    findFirstByUserIdAndType: vi.fn(),
  };

  const mockCashbackQueueRepo = {
    findFirstByWorkshopAndUser: vi.fn(),
    findPendingDue: vi.fn(),
    findFailedRetriable: vi.fn(),
    findProcessedWithProcessedAt: vi.fn(),
    findProcessedByDate: vi.fn(),
    findProcessedWithoutProcessedAt: vi.fn(),
    findNonProcessedWithProcessedAt: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  };

  const mockCreditService = {
    creditCredits: vi.fn(),
  };

  const mockNotificationService = {
    createNotification: vi.fn(),
  };

  let service: WorkshopCashbackService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new WorkshopCashbackService(
      mockWorkshopRepo as any,
      mockAppUserRepo as any,
      mockCreditTransactionRepo as any,
      mockCashbackQueueRepo as any,
      mockCreditService as any,
      mockNotificationService as any
    );
  });

  describe("processCashback", () => {
    it("returns failure when workshop not found", async () => {
      mockWorkshopRepo.findById.mockResolvedValue(null);

      const result = await service.processCashback(
        "ws-1",
        "user-1",
        new Date()
      );
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe("Atelier introuvable");
        expect(result.status).toBe(404);
      }
    });

    it("returns failure when no participant enrolled", async () => {
      mockWorkshopRepo.findById.mockResolvedValue({
        apprenticeId: null,
        apprentice: null,
      });

      const result = await service.processCashback(
        "ws-1",
        "user-1",
        new Date()
      );
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.status).toBe(400);
      }
    });

    it("returns failure when user is not the participant", async () => {
      mockWorkshopRepo.findById.mockResolvedValue({
        apprenticeId: "app-1",
        apprentice: { user: { id: "other-user" } },
        apprenticeAttendanceStatus: "PRESENT",
      });

      const result = await service.processCashback(
        "ws-1",
        "user-1",
        new Date()
      );
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.status).toBe(403);
      }
    });

    it("returns failure when attendance is not PRESENT", async () => {
      mockWorkshopRepo.findById.mockResolvedValue({
        apprenticeId: "app-1",
        apprentice: { user: { id: "user-1" } },
        apprenticeAttendanceStatus: "PENDING",
      });

      const result = await service.processCashback(
        "ws-1",
        "user-1",
        new Date()
      );
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.status).toBe(400);
      }
    });

    it("returns success with queued:false when already PROCESSED", async () => {
      mockWorkshopRepo.findById.mockResolvedValue({
        apprenticeId: "app-1",
        apprentice: { user: { id: "user-1" } },
        apprenticeAttendanceStatus: "PRESENT",
      });
      mockCashbackQueueRepo.findFirstByWorkshopAndUser.mockResolvedValue({
        id: "q-1",
        status: "PROCESSED",
        cashbackAmount: 3,
      });

      const result = await service.processCashback(
        "ws-1",
        "user-1",
        new Date()
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.queued).toBe(false);
        expect(result.data.cashbackAmount).toBe(3);
      }
    });

    it("processes immediate cashback when workshop is finished", async () => {
      const pastEnd = new Date(Date.now() - 60000);
      mockWorkshopRepo.findById
        .mockResolvedValueOnce({
          apprenticeId: "app-1",
          apprentice: { user: { id: "user-1" } },
          apprenticeAttendanceStatus: "PRESENT",
        })
        .mockResolvedValueOnce({ creditCost: 40 });
      mockCashbackQueueRepo.findFirstByWorkshopAndUser.mockResolvedValue(null);
      mockCreditService.creditCredits.mockResolvedValue({ ok: true });

      const result = await service.processCashback(
        "ws-1",
        "user-1",
        pastEnd
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.queued).toBe(false);
      }
      expect(mockCreditService.creditCredits).toHaveBeenCalled();
    });

    it("queues cashback when workshop is not yet finished", async () => {
      const futureEnd = new Date(Date.now() + 3600000);
      mockWorkshopRepo.findById
        .mockResolvedValueOnce({
          apprenticeId: "app-1",
          apprentice: { user: { id: "user-1" } },
          apprenticeAttendanceStatus: "PRESENT",
        })
        .mockResolvedValueOnce({ creditCost: 40 });
      mockCashbackQueueRepo.findFirstByWorkshopAndUser.mockResolvedValue(null);
      mockCashbackQueueRepo.create.mockResolvedValue({});

      const result = await service.processCashback(
        "ws-1",
        "user-1",
        futureEnd
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.queued).toBe(true);
      }
      expect(mockCashbackQueueRepo.create).toHaveBeenCalled();
    });

    it("returns failure when immediate credit fails", async () => {
      const pastEnd = new Date(Date.now() - 60000);
      mockWorkshopRepo.findById
        .mockResolvedValueOnce({
          apprenticeId: "app-1",
          apprentice: { user: { id: "user-1" } },
          apprenticeAttendanceStatus: "PRESENT",
        })
        .mockResolvedValueOnce({ creditCost: 40 });
      mockCashbackQueueRepo.findFirstByWorkshopAndUser.mockResolvedValue(null);
      mockCreditService.creditCredits.mockResolvedValue({
        ok: false,
        error: "insufficient",
      });

      const result = await service.processCashback(
        "ws-1",
        "user-1",
        pastEnd
      );
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.status).toBe(500);
      }
    });
  });

  describe("checkDataIntegrity", () => {
    it("returns empty array when no issues found", async () => {
      mockCashbackQueueRepo.findProcessedWithoutProcessedAt.mockResolvedValue(
        []
      );
      mockCashbackQueueRepo.findNonProcessedWithProcessedAt.mockResolvedValue(
        []
      );

      const result = await service.checkDataIntegrity();
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toEqual([]);
      }
    });

    it("detects PROCESSED without processedAt", async () => {
      mockCashbackQueueRepo.findProcessedWithoutProcessedAt.mockResolvedValue([
        {
          id: "tx-1",
          workshopId: "ws-1",
          participantUserId: "user-1",
          status: "PROCESSED",
        },
      ]);
      mockCashbackQueueRepo.findNonProcessedWithProcessedAt.mockResolvedValue(
        []
      );

      const result = await service.checkDataIntegrity();
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0].issue).toContain(
          "PROCESSED but processedAt is NULL"
        );
      }
    });
  });
});
