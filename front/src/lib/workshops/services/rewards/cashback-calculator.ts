import type { IWorkshopRepository } from "../../repositories/workshop.repository.interface";
import type { AppUserRepository } from "../../../users/repositories";
import type { ICreditTransactionRepository } from "../../../credits/repositories/credit-transaction.repository.interface";

export interface ICashbackCalculator {
  getWorkshopPrice(
    workshopId: string,
    participantUserId: string
  ): Promise<number>;
  calculateCashbackAmount(workshopPrice: number): number;
}

export class CashbackCalculator implements ICashbackCalculator {
  private readonly CASHBACK_PERCENTAGE = 0.05;
  private readonly MIN_CASHBACK = 1;
  private readonly DEFAULT_WORKSHOP_PRICE = 20;
  private readonly MIN_WORKSHOP_PRICE = 20;

  constructor(
    private readonly workshopRepository: IWorkshopRepository,
    private readonly appUserRepository: AppUserRepository,
    private readonly creditTransactionRepository: ICreditTransactionRepository
  ) {}

  async getWorkshopPrice(
    workshopId: string,
    participantUserId: string
  ): Promise<number> {
    const priceFromWorkshop = await this.getPriceFromWorkshop(workshopId);
    if (priceFromWorkshop !== null) {
      return priceFromWorkshop;
    }

    const priceFromTransaction = await this.getPriceFromCreditTransaction(
      workshopId,
      participantUserId
    );
    if (priceFromTransaction !== null) {
      return priceFromTransaction;
    }

    return this.DEFAULT_WORKSHOP_PRICE;
  }

  calculateCashbackAmount(workshopPrice: number): number {
    const calculatedAmount = workshopPrice * this.CASHBACK_PERCENTAGE;
    return Math.max(this.MIN_CASHBACK, Math.floor(calculatedAmount));
  }

  private async getPriceFromWorkshop(
    workshopId: string
  ): Promise<number | null> {
    const workshop = await this.workshopRepository.findById(workshopId);

    if (workshop?.creditCost && workshop.creditCost > 0) {
      return Math.max(this.MIN_WORKSHOP_PRICE, workshop.creditCost);
    }

    return null;
  }

  private async getPriceFromCreditTransaction(
    workshopId: string,
    participantUserId: string
  ): Promise<number | null> {
    const appUser = await this.appUserRepository.findByUserId(
      participantUserId
    );

    if (!appUser) {
      return null;
    }

    const creditTransaction =
      await this.creditTransactionRepository.findFirstByUserIdAndType(
        appUser.id,
        "USAGE",
        {
          descriptionContains: workshopId,
          orderBy: "desc",
        }
      );

    if (creditTransaction && creditTransaction.amount > 0) {
      const transactionAmount = Math.abs(creditTransaction.amount);
      return Math.max(this.MIN_WORKSHOP_PRICE, transactionAmount);
    }

    return null;
  }
}
