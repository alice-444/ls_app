import type { Result } from "../../../common";

export interface IWorkshopNoShowPenaltyService {
  applyPenalty(
    workshopId: string,
    participantUserId: string
  ): Promise<Result<{ penaltyApplied: boolean }>>;
}
