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

  describe("getHistory", () => {
    const mockUser = { id: "internal-id-1" };
    const mockTransactions = [
      { id: "tx-1", amount: 100,  type: "TOP_UP", description: "Rechargement", createdAt: new Date() },
      { id: "tx-2", amount: -30,  type: "USAGE",  description: "Atelier React", createdAt: new Date() },
      { id: "tx-3", amount: 30,   type: "REFUND", description: "Remboursement", createdAt: new Date() },
    ];

    beforeEach(() => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.credit_transaction.findMany.mockResolvedValue(mockTransactions);
      mockPrisma.credit_transaction.count.mockResolvedValue(mockTransactions.length);
    });

    it("returns all transactions when no type filter", async () => {
      const result = await creditService.getHistory("user-1");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.transactions).toHaveLength(3);
        expect(result.data.total).toBe(3);
      }
      expect(mockPrisma.credit_transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: mockUser.id } })
      );
    });

    it("passes type filter to Prisma when type is provided", async () => {
      const topUpOnly = [mockTransactions[0]];
      mockPrisma.credit_transaction.findMany.mockResolvedValue(topUpOnly);
      mockPrisma.credit_transaction.count.mockResolvedValue(1);

      const result = await creditService.getHistory("user-1", { type: "TOP_UP" });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.transactions).toHaveLength(1);
        expect(result.data.total).toBe(1);
      }
      expect(mockPrisma.credit_transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: mockUser.id, type: "TOP_UP" } })
      );
      expect(mockPrisma.credit_transaction.count).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: mockUser.id, type: "TOP_UP" } })
      );
    });

    it("passes USAGE filter correctly", async () => {
      mockPrisma.credit_transaction.findMany.mockResolvedValue([mockTransactions[1]]);
      mockPrisma.credit_transaction.count.mockResolvedValue(1);

      const result = await creditService.getHistory("user-1", { type: "USAGE" });

      expect(result.ok).toBe(true);
      expect(mockPrisma.credit_transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: mockUser.id, type: "USAGE" } })
      );
    });

    it("passes REFUND filter correctly", async () => {
      mockPrisma.credit_transaction.findMany.mockResolvedValue([mockTransactions[2]]);
      mockPrisma.credit_transaction.count.mockResolvedValue(1);

      const result = await creditService.getHistory("user-1", { type: "REFUND" });

      expect(result.ok).toBe(true);
      expect(mockPrisma.credit_transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: mockUser.id, type: "REFUND" } })
      );
    });

    it("returns failure when user is not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await creditService.getHistory("unknown-user");

      expect(result.ok).toBe(false);
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
