import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../../src/lib/common/prisma", () => ({ prisma: {} }));
vi.mock("../../../../src/lib/common/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));
vi.mock("../../../../src/lib/utils/id-generator", () => ({
  generateInternalId: () => "generated-id",
}));

import { CreditService } from "../../../../src/lib/credits/services/credit.service";

describe("CreditService", () => {
  const mockAppUserFindUnique = vi.fn();
  const mockAppUserUpdate = vi.fn();
  const mockCreditTransactionCreate = vi.fn();
  const mockTransaction = vi.fn();

  const mockPrisma = {
    app_user: {
      findUnique: mockAppUserFindUnique,
      update: mockAppUserUpdate,
    },
    credit_transaction: {
      create: mockCreditTransactionCreate,
    },
    $transaction: mockTransaction,
  };

  let service: CreditService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CreditService(mockPrisma as any);
  });

  describe("checkBalance", () => {
    it("returns balance 0 when user not found", async () => {
      mockAppUserFindUnique.mockResolvedValue(null);

      const result = await service.checkBalance("user-1", 10);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.balance).toBe(0);
        expect(result.data.hasEnough).toBe(false);
      }
    });

    it("returns balance and hasEnough:true when sufficient", async () => {
      mockAppUserFindUnique.mockResolvedValue({ creditBalance: 50 });

      const result = await service.checkBalance("user-1", 30);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.balance).toBe(50);
        expect(result.data.hasEnough).toBe(true);
      }
    });

    it("returns hasEnough:false when insufficient", async () => {
      mockAppUserFindUnique.mockResolvedValue({ creditBalance: 5 });

      const result = await service.checkBalance("user-1", 10);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.balance).toBe(5);
        expect(result.data.hasEnough).toBe(false);
      }
    });

    it("returns hasEnough:true when exact amount", async () => {
      mockAppUserFindUnique.mockResolvedValue({ creditBalance: 10 });

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

    it("returns failure for negative amount", async () => {
      const result = await service.debitCredits("user-1", -5, "test");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(400);
    });

    it("returns failure when balance is insufficient", async () => {
      mockTransaction.mockImplementation(async (cb: Function) => {
        const tx = {
          app_user: {
            findUnique: vi.fn().mockResolvedValue({
              id: "app-1",
              creditBalance: 5,
            }),
            update: vi.fn(),
          },
          credit_transaction: { create: vi.fn() },
        };
        return cb(tx);
      });

      const result = await service.debitCredits("user-1", 10, "test");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain("insuffisants");
        expect(result.status).toBe(400);
      }
    });

    it("succeeds and returns new balance", async () => {
      mockTransaction.mockImplementation(async (cb: Function) => {
        const txAppUserFindUnique = vi.fn();
        const txAppUserUpdate = vi.fn();
        const txCreditTransactionCreate = vi.fn();

        txAppUserFindUnique.mockResolvedValue({
          id: "app-1",
          creditBalance: 50,
        });
        txAppUserUpdate.mockResolvedValue({ creditBalance: 40 });
        txCreditTransactionCreate.mockResolvedValue({ id: "generated-id" });

        const tx = {
          app_user: {
            findUnique: txAppUserFindUnique,
            update: txAppUserUpdate,
          },
          credit_transaction: { create: txCreditTransactionCreate },
        };
        return cb(tx);
      });

      const result = await service.debitCredits("user-1", 10, "test debit");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.newBalance).toBe(40);
        expect(result.data.transactionId).toBe("generated-id");
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
      const result = await service.creditCredits("user-1", 100_001, "test");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain("100000");
        expect(result.status).toBe(400);
      }
    });

    it("succeeds at exactly 100 000", async () => {
      mockTransaction.mockImplementation(async (cb: Function) => {
        const tx = {
          app_user: {
            findUnique: vi
              .fn()
              .mockResolvedValue({ id: "app-1", creditBalance: 0 }),
            update: vi.fn().mockResolvedValue({ creditBalance: 100_000 }),
          },
          credit_transaction: {
            create: vi.fn().mockResolvedValue({ id: "generated-id" }),
          },
        };
        return cb(tx);
      });

      const result = await service.creditCredits("user-1", 100_000, "test");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.newBalance).toBe(100_000);
      }
    });

    it("succeeds and returns new balance", async () => {
      mockTransaction.mockImplementation(async (cb: Function) => {
        const tx = {
          app_user: {
            findUnique: vi
              .fn()
              .mockResolvedValue({ id: "app-1", creditBalance: 10 }),
            update: vi.fn().mockResolvedValue({ creditBalance: 20 }),
          },
          credit_transaction: {
            create: vi.fn().mockResolvedValue({ id: "generated-id" }),
          },
        };
        return cb(tx);
      });

      const result = await service.creditCredits("user-1", 10, "test credit");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.newBalance).toBe(20);
        expect(result.data.transactionId).toBe("generated-id");
      }
    });
  });

  describe("getBalance", () => {
    it("returns 0 when user not found", async () => {
      mockAppUserFindUnique.mockResolvedValue(null);

      const result = await service.getBalance("user-1");
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.data.balance).toBe(0);
    });

    it("returns user balance", async () => {
      mockAppUserFindUnique.mockResolvedValue({ creditBalance: 42 });

      const result = await service.getBalance("user-1");
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.data.balance).toBe(42);
    });
  });
});
