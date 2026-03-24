import type { Result } from "../../../common";

export interface IWorkshopTippingService {
  sendTip(
    fromUserId: string,
    toMentorUserId: string,
    amount: number
  ): Promise<Result<{ success: boolean; newBalance: number }>>;
}
