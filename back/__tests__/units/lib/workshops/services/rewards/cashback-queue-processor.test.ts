import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../../../../src/lib/common/prisma", () => ({ prisma: {} }));
vi.mock("../../../../../../src/lib/common/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { CashbackQueueProcessor } from "../../../../../../src/lib/workshops/services/rewards/cashback-queue-processor";

describe("CashbackQueueProcessor", () => {
  const mockCashbackQueueRepo = {
    findPendingDue: vi.fn(),
    findFailedRetriable: vi.fn(),
    update: vi.fn(),
  };

  const mockCreditService = {
    creditCredits: vi.fn(),
  };

  const mockNotificationService = {
    createNotification: vi.fn(),
  };

  let processor: CashbackQueueProcessor;

  beforeEach(() => {
    vi.clearAllMocks();
    processor = new CashbackQueueProcessor(
      mockCashbackQueueRepo as any,
      mockCreditService as any,
      mockNotificationService as any
    );
  });

  describe("processQueuedCashbacks", () => {
    it("returns 0/0 when no queued transactions", async () => {
      mockCashbackQueueRepo.findPendingDue.mockResolvedValue([]);

      const result = await processor.processQueuedCashbacks();
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toEqual({ processed: 0, failed: 0 });
      }
    });

    it("marks transaction as PROCESSED when credit succeeds", async () => {
      const tx = {
        id: "tx-1",
        participantUserId: "user-1",
        cashbackAmount: 2,
        workshopId: "ws-1",
        retryCount: 0,
      };
      mockCashbackQueueRepo.findPendingDue.mockResolvedValue([tx]);
      mockCreditService.creditCredits.mockResolvedValue({ ok: true });
      mockCashbackQueueRepo.update.mockResolvedValue({});
      mockNotificationService.createNotification.mockResolvedValue({});

      const result = await processor.processQueuedCashbacks();
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.processed).toBe(1);
        expect(result.data.failed).toBe(0);
      }

      expect(mockCashbackQueueRepo.update).toHaveBeenCalledWith(
        "tx-1",
        expect.objectContaining({ status: "PROCESSED" })
      );
    });

    it("keeps PENDING when credit fails below max retries", async () => {
      const tx = {
        id: "tx-1",
        participantUserId: "user-1",
        cashbackAmount: 2,
        workshopId: "ws-1",
        retryCount: 0,
      };
      mockCashbackQueueRepo.findPendingDue.mockResolvedValue([tx]);
      mockCreditService.creditCredits.mockResolvedValue({
        ok: false,
        error: "credit error",
      });
      mockCashbackQueueRepo.update.mockResolvedValue({});

      const result = await processor.processQueuedCashbacks();
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.processed).toBe(0);
        expect(result.data.failed).toBe(0);
      }

      expect(mockCashbackQueueRepo.update).toHaveBeenCalledWith(
        "tx-1",
        expect.objectContaining({ status: "PENDING", retryCount: 1 })
      );
    });

    it("marks FAILED when credit fails at max retries", async () => {
      const tx = {
        id: "tx-1",
        participantUserId: "user-1",
        cashbackAmount: 2,
        workshopId: "ws-1",
        retryCount: 2,
      };
      mockCashbackQueueRepo.findPendingDue.mockResolvedValue([tx]);
      mockCreditService.creditCredits.mockResolvedValue({
        ok: false,
        error: "credit error",
      });
      mockCashbackQueueRepo.update.mockResolvedValue({});

      const result = await processor.processQueuedCashbacks();
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.processed).toBe(0);
        expect(result.data.failed).toBe(1);
      }

      expect(mockCashbackQueueRepo.update).toHaveBeenCalledWith(
        "tx-1",
        expect.objectContaining({ status: "FAILED", retryCount: 3 })
      );
    });

    it("handles exception during credit as retrying", async () => {
      const tx = {
        id: "tx-1",
        participantUserId: "user-1",
        cashbackAmount: 2,
        workshopId: "ws-1",
        retryCount: 0,
      };
      mockCashbackQueueRepo.findPendingDue.mockResolvedValue([tx]);
      mockCreditService.creditCredits.mockRejectedValue(
        new Error("network error")
      );
      mockCashbackQueueRepo.update.mockResolvedValue({});

      const result = await processor.processQueuedCashbacks();
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.processed).toBe(0);
        expect(result.data.failed).toBe(0);
      }
    });

    it("returns failure when repo throws", async () => {
      mockCashbackQueueRepo.findPendingDue.mockRejectedValue(
        new Error("DB error")
      );

      const result = await processor.processQueuedCashbacks();
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe("DB error");
      }
    });
  });

  describe("retryFailedCashbacks", () => {
    it("returns 0/0 when no failed transactions", async () => {
      mockCashbackQueueRepo.findFailedRetriable.mockResolvedValue([]);

      const result = await processor.retryFailedCashbacks();
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toEqual({ retried: 0, stillFailed: 0 });
      }
    });

    it("increments retried when retry credit succeeds", async () => {
      const tx = {
        id: "tx-1",
        participantUserId: "user-1",
        cashbackAmount: 2,
        workshopId: "ws-1",
        retryCount: 1,
      };
      mockCashbackQueueRepo.findFailedRetriable.mockResolvedValue([tx]);
      mockCreditService.creditCredits.mockResolvedValue({ ok: true });
      mockCashbackQueueRepo.update.mockResolvedValue({});
      mockNotificationService.createNotification.mockResolvedValue({});

      const result = await processor.retryFailedCashbacks();
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.retried).toBe(1);
        expect(result.data.stillFailed).toBe(0);
      }
    });

    it("increments stillFailed when retry fails at max retries", async () => {
      const tx = {
        id: "tx-1",
        participantUserId: "user-1",
        cashbackAmount: 2,
        workshopId: "ws-1",
        retryCount: 2,
      };
      mockCashbackQueueRepo.findFailedRetriable.mockResolvedValue([tx]);
      mockCreditService.creditCredits.mockResolvedValue({
        ok: false,
        error: "still failing",
      });
      mockCashbackQueueRepo.update.mockResolvedValue({});

      const result = await processor.retryFailedCashbacks();
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.retried).toBe(0);
        expect(result.data.stillFailed).toBe(1);
      }
    });

    it("returns failure when repo throws", async () => {
      mockCashbackQueueRepo.findFailedRetriable.mockRejectedValue(
        new Error("DB error")
      );

      const result = await processor.retryFailedCashbacks();
      expect(result.ok).toBe(false);
    });
  });
});
