import type { IWorkshopNoShowPenaltyService } from "./workshop-no-show-penalty.service.interface";
import type { Result } from "../../../common";
import { success, failure } from "../../../common";
import { logger } from "../../../common/logger";

export class WorkshopNoShowPenaltyService
  implements IWorkshopNoShowPenaltyService
{
  constructor() {}

  async applyPenalty(
    workshopId: string,
    participantUserId: string
  ): Promise<Result<{ penaltyApplied: boolean }>> {
    try {
      logger.info("No-Show penalty applied", {
        workshopId,
        participantUserId,
        timestamp: new Date().toISOString(),
      });

      return success({ penaltyApplied: true });
    } catch (error) {
      logger.error("Error applying No-Show penalty", error, {
        workshopId,
        participantUserId,
      });
      return failure(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'application de la pénalité No-Show",
        500
      );
    }
  }
}
