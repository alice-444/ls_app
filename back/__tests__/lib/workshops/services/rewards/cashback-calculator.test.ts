import { describe, it, expect, vi, beforeEach } from "vitest";
import { CashbackCalculator } from "../../../../../src/lib/workshops/services/rewards/cashback-calculator";

describe("CashbackCalculator", () => {
  const mockWorkshopRepository = {
    findById: vi.fn(),
    findByCreatorId: vi.fn(),
    findPublished: vi.fn(),
    findByApprenticeId: vi.fn(),
    update: vi.fn(),
  };

  const mockAppUserRepository = {
    findByUserId: vi.fn(),
  };

  const mockCreditTransactionRepository = {
    findFirstByUserIdAndType: vi.fn(),
  };

  let calculator: CashbackCalculator;

  beforeEach(() => {
    vi.clearAllMocks();
    calculator = new CashbackCalculator(
      mockWorkshopRepository as any,
      mockAppUserRepository as any,
      mockCreditTransactionRepository as any
    );
  });

  describe("calculateCashbackAmount", () => {
    it("returns 1 for standard price of 20 (5% = 1)", () => {
      expect(calculator.calculateCashbackAmount(20)).toBe(1);
    });

    it("returns 5 for price of 100 (5% = 5)", () => {
      expect(calculator.calculateCashbackAmount(100)).toBe(5);
    });

    it("returns MIN_CASHBACK (1) for very low price", () => {
      expect(calculator.calculateCashbackAmount(10)).toBe(1);
    });

    it("floors the result", () => {
      // 50 * 0.05 = 2.5, floor -> 2
      expect(calculator.calculateCashbackAmount(50)).toBe(2);
    });

    it("returns 10 for price of 200 (5% = 10)", () => {
      expect(calculator.calculateCashbackAmount(200)).toBe(10);
    });

    it("returns MIN_CASHBACK for price of 0", () => {
      expect(calculator.calculateCashbackAmount(0)).toBe(1);
    });
  });

  describe("getWorkshopPrice", () => {
    it("returns creditCost when workshop has creditCost > 0", async () => {
      mockWorkshopRepository.findById.mockResolvedValue({ creditCost: 50 });

      const price = await calculator.getWorkshopPrice("ws-1", "user-1");
      expect(price).toBe(50);
    });

    it("enforces MIN_WORKSHOP_PRICE when creditCost < 20", async () => {
      mockWorkshopRepository.findById.mockResolvedValue({ creditCost: 10 });

      const price = await calculator.getWorkshopPrice("ws-1", "user-1");
      expect(price).toBe(20);
    });

    it("falls back to credit transaction when creditCost is null", async () => {
      mockWorkshopRepository.findById.mockResolvedValue({ creditCost: null });
      mockAppUserRepository.findByUserId.mockResolvedValue({ id: "app-1" });
      mockCreditTransactionRepository.findFirstByUserIdAndType.mockResolvedValue(
        { amount: 30 }
      );

      const price = await calculator.getWorkshopPrice("ws-1", "user-1");
      expect(price).toBe(30);
    });

    it("falls back to credit transaction when creditCost is 0", async () => {
      mockWorkshopRepository.findById.mockResolvedValue({ creditCost: 0 });
      mockAppUserRepository.findByUserId.mockResolvedValue({ id: "app-1" });
      mockCreditTransactionRepository.findFirstByUserIdAndType.mockResolvedValue(
        { amount: 40 }
      );

      const price = await calculator.getWorkshopPrice("ws-1", "user-1");
      expect(price).toBe(40);
    });

    it("enforces MIN_WORKSHOP_PRICE on transaction amount", async () => {
      mockWorkshopRepository.findById.mockResolvedValue({ creditCost: null });
      mockAppUserRepository.findByUserId.mockResolvedValue({ id: "app-1" });
      mockCreditTransactionRepository.findFirstByUserIdAndType.mockResolvedValue(
        { amount: 5 }
      );

      const price = await calculator.getWorkshopPrice("ws-1", "user-1");
      expect(price).toBe(20);
    });

    it("returns DEFAULT_WORKSHOP_PRICE when no workshop and no transaction", async () => {
      mockWorkshopRepository.findById.mockResolvedValue(null);
      mockAppUserRepository.findByUserId.mockResolvedValue({ id: "app-1" });
      mockCreditTransactionRepository.findFirstByUserIdAndType.mockResolvedValue(
        null
      );

      const price = await calculator.getWorkshopPrice("ws-1", "user-1");
      expect(price).toBe(20);
    });

    it("returns DEFAULT_WORKSHOP_PRICE when appUser not found", async () => {
      mockWorkshopRepository.findById.mockResolvedValue(null);
      mockAppUserRepository.findByUserId.mockResolvedValue(null);

      const price = await calculator.getWorkshopPrice("ws-1", "user-1");
      expect(price).toBe(20);
    });

    it("returns DEFAULT_WORKSHOP_PRICE when transaction amount is 0", async () => {
      mockWorkshopRepository.findById.mockResolvedValue({ creditCost: null });
      mockAppUserRepository.findByUserId.mockResolvedValue({ id: "app-1" });
      mockCreditTransactionRepository.findFirstByUserIdAndType.mockResolvedValue(
        { amount: 0 }
      );

      const price = await calculator.getWorkshopPrice("ws-1", "user-1");
      expect(price).toBe(20);
    });
  });
});
