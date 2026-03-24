import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreditService } from "@/lib/credits/services/credit.service";
import { success, failure } from "@/lib/common/types";

describe("CreditService", () => {
  let creditService: CreditService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      credit_transaction: {
        create: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
      },
      $transaction: vi.fn((callback) => callback(mockPrisma)),
    };
    creditService = new CreditService(mockPrisma);
    vi.clearAllMocks();
  });

  describe("getBalance", () => {
    it("returns user balance when user exists", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ creditBalance: 150 });
      
      const result = await creditService.getBalance("user-1");
      
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.balance).toBe(150);
      }
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith(expect.objectContaining({
        where: { userId: "user-1" }
      }));
    });

    it("returns 0 balance when user does not exist", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const result = await creditService.getBalance("non-existent");
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.data.balance).toBe(0);
    });
  });

  describe("debitCredits", () => {
    it("fails if amount is negative", async () => {
      const result = await creditService.debitCredits("user-1", -10, "test");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toBe("Le montant doit être positif.");
    });

    it("fails if user has insufficient credits", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ userId: "user-1", creditBalance: 5 });
      
      const result = await creditService.debitCredits("user-1", 10, "test");
      
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toBe("Crédits insuffisants.");
    });

    it("successfully debits credits and creates transaction", async () => {
      const initialBalance = 100;
      const debitAmount = 30;
      const mockUser = { id: "internal-id-1", userId: "user-1", creditBalance: initialBalance };
      
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue({ ...mockUser, creditBalance: initialBalance - debitAmount });
      mockPrisma.credit_transaction.create.mockResolvedValue({ id: "tx-123" });

      const result = await creditService.debitCredits("user-1", debitAmount, "Purchase");

      expect(result.ok).toBe(true);
      expect(mockPrisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
        data: { creditBalance: { decrement: debitAmount } }
      }));
      expect(mockPrisma.credit_transaction.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          amount: -debitAmount,
          type: "USAGE"
        })
      }));
    });
  });

  describe("creditCredits", () => {
    it("fails if MAX_BALANCE is reached", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ creditBalance: 99995 });
      
      const result = await creditService.creditCredits("user-1", 10, "Top up");
      
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toContain("Le solde maximal est atteint");
    });

    it("successfully credits account", async () => {
      const mockUser = { id: "uid-1", creditBalance: 100 };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue({ ...mockUser, creditBalance: 150 });
      mockPrisma.credit_transaction.create.mockResolvedValue({ id: "tx-456" });

      const result = await creditService.creditCredits("user-1", 50, "Refund from admin");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.newBalance).toBe(150);
      }
    });
  });
});
