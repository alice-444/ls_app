import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../../../../src/lib/common/prisma", () => ({ prisma: {} }));
vi.mock("../../../../../../src/lib/common/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { WorkshopTippingService } from "../../../../../../src/lib/workshops/services/feedback/workshop-tipping.service";

describe("WorkshopTippingService", () => {
  const mockCreditService = {
    checkBalance: vi.fn(),
    debitCredits: vi.fn(),
    creditCredits: vi.fn(),
  };

  let service: WorkshopTippingService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new WorkshopTippingService(mockCreditService as any);
  });

  describe("sendTip", () => {
    it("returns failure for invalid amount (less than 1)", async () => {
      const result = await service.sendTip("from", "to", 0);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain("1 à 100");
        expect(result.status).toBe(400);
      }
    });

    it("returns failure for invalid amount (more than 100)", async () => {
      const result = await service.sendTip("from", "to", 101);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain("1 à 100");
        expect(result.status).toBe(400);
      }
    });

    it("returns failure when balance check fails", async () => {
      mockCreditService.checkBalance.mockResolvedValue({
        ok: false,
        error: "service error",
      });

      const result = await service.sendTip("from", "to", 1);
      expect(result.ok).toBe(false);
    });

    it("returns failure when balance is insufficient", async () => {
      mockCreditService.checkBalance.mockResolvedValue({
        ok: true,
        data: { hasEnough: false, balance: 0 },
      });

      const result = await service.sendTip("from", "to", 2);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain("insuffisants");
        expect(result.status).toBe(400);
      }
    });

    it("returns failure when debit fails", async () => {
      mockCreditService.checkBalance.mockResolvedValue({
        ok: true,
        data: { hasEnough: true, balance: 10 },
      });
      mockCreditService.debitCredits.mockResolvedValue({
        ok: false,
        error: "debit error",
        status: 500,
      });

      const result = await service.sendTip("from", "to", 1);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain("débit");
      }
    });

    it("rolls back when credit to mentor fails", async () => {
      mockCreditService.checkBalance.mockResolvedValue({
        ok: true,
        data: { hasEnough: true, balance: 10 },
      });
      mockCreditService.debitCredits.mockResolvedValue({
        ok: true,
        data: { newBalance: 9 },
      });
      mockCreditService.creditCredits
        .mockResolvedValueOnce({ ok: false, error: "credit error", status: 500 })
        .mockResolvedValueOnce({ ok: true });

      const result = await service.sendTip("from", "to", 1);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain("crédit au mentor");
      }

      expect(mockCreditService.creditCredits).toHaveBeenCalledTimes(2);
      expect(mockCreditService.creditCredits).toHaveBeenLastCalledWith(
        "from",
        1,
        expect.stringContaining("Remboursement")
      );
    });

    it("succeeds with amount 1", async () => {
      mockCreditService.checkBalance.mockResolvedValue({
        ok: true,
        data: { hasEnough: true, balance: 10 },
      });
      mockCreditService.debitCredits.mockResolvedValue({
        ok: true,
        data: { newBalance: 9 },
      });
      mockCreditService.creditCredits.mockResolvedValue({ ok: true });

      const result = await service.sendTip("from", "to", 1);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.success).toBe(true);
        expect(result.data.newBalance).toBe(9);
      }
    });

    it("succeeds with amount 2", async () => {
      mockCreditService.checkBalance.mockResolvedValue({
        ok: true,
        data: { hasEnough: true, balance: 10 },
      });
      mockCreditService.debitCredits.mockResolvedValue({
        ok: true,
        data: { newBalance: 8 },
      });
      mockCreditService.creditCredits.mockResolvedValue({ ok: true });

      const result = await service.sendTip("from", "to", 2);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.newBalance).toBe(8);
      }
    });

    it("returns failure on unexpected exception", async () => {
      mockCreditService.checkBalance.mockRejectedValue(
        new Error("network failure")
      );

      const result = await service.sendTip("from", "to", 1);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe("network failure");
        expect(result.status).toBe(500);
      }
    });
  });
});
