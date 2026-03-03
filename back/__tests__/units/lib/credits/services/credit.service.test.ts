import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreditService } from "@/lib/credits/services/credit.service";

describe("CreditService", () => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    credit_transaction: {
      create: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(mockPrisma)),
  };

  let service: CreditService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CreditService(mockPrisma as any);
  });

  describe("checkBalance", () => {
    it("returns balance 0 when user not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await service.checkBalance("user-1", 10);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.balance).toBe(0);
        expect(result.data.hasEnough).toBe(false);
      }
    });

    it("returns balance and hasEnough:true when sufficient", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ creditBalance: 50 });

      const result = await service.checkBalance("user-1", 30);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.balance).toBe(50);
        expect(result.data.hasEnough).toBe(true);
      }
    });

    it("returns hasEnough:false when insufficient", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ creditBalance: 5 });

      const result = await service.checkBalance("user-1", 10);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.balance).toBe(5);
        expect(result.data.hasEnough).toBe(false);
      }
    });

    it("returns hasEnough:true when exact amount", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ creditBalance: 10 });

      const result = await service.checkBalance("user-1", 10);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.data.hasEnough).toBe(true);
    });
  });

  describe("debitCredits", () => {
    it("returns failure for amount <= 0", async () => {
      const result = await service.debitCredits("user-1", 0, "test");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain("positif");
        expect(result.status).toBe(400);
      }
    });

    it("returns failure when balance is insufficient", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ creditBalance: 5 });

      const result = await service.debitCredits("user-1", 10, "test");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain("insuffisants");
        expect(result.status).toBe(400);
      }
    });

    it("succeeds and returns new balance", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: "int-1", creditBalance: 50 });
      mockPrisma.user.update.mockResolvedValue({ creditBalance: 40 });

      const result = await service.debitCredits("user-1", 10, "test debit");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.newBalance).toBe(40);
      }
    });
  });

  describe("creditCredits", () => {
    it("returns failure for amount <= 0", async () => {
      const result = await service.creditCredits("user-1", 0, "test");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain("positif");
        expect(result.status).toBe(400);
      }
    });

    it("returns failure when amount exceeds cap (100 000)", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ creditBalance: 99_999 });

      const result = await service.creditCredits("user-1", 10, "test");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain("100000");
        expect(result.status).toBe(400);
      }
    });

    it("succeeds and returns new balance", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: "int-1", creditBalance: 10 });
      mockPrisma.user.update.mockResolvedValue({ creditBalance: 20 });

      const result = await service.creditCredits("user-1", 10, "test credit");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.newBalance).toBe(20);
      }
    });
  });

  describe("getBalance", () => {
    it("returns 0 when user not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await service.getBalance("user-1");
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.data.balance).toBe(0);
    });

    it("returns user balance", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ creditBalance: 42 });

      const result = await service.getBalance("user-1");
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.data.balance).toBe(42);
    });
  });
});
