import type { Result } from "../../../common";
import { success } from "../../../common";
import { handleError, createErrorContext } from "../../../common/error-handler";
import type { IWorkshopRepository } from "../../repositories/workshop.repository.interface";
import {
  doTimeRangesOverlap,
  calculateWorkshopStartTime,
  calculateWorkshopEndTime,
  isWorkshopValidForConflictCheck,
  calculateWorkshopTimeRange,
} from "../../utils/workshop-helpers";
import { failure } from "../../../common";

export interface ISchedulingConflictChecker {
  checkResourceConflicts(
    mentorId: string,
    workshopId: string,
    newDate: Date,
    newTime: string,
    newDuration: number,
    newLocation: string | null,
    isVirtual: boolean
  ): Promise<Result<{ hasConflict: boolean; conflictMessage?: string }>>;
}

export class SchedulingConflictChecker implements ISchedulingConflictChecker {
  constructor(
    private readonly workshopRepository: IWorkshopRepository
  ) {}

  async checkResourceConflicts(
    mentorId: string,
    workshopId: string,
    newDate: Date,
    newTime: string,
    newDuration: number,
    newLocation: string | null,
    isVirtual: boolean
  ): Promise<Result<{ hasConflict: boolean; conflictMessage?: string }>> {
    try {
      const newStartTime = calculateWorkshopStartTime(newDate, newTime);
      const newEndTime = calculateWorkshopEndTime(newDate, newTime, newDuration);

      if (!newStartTime || !newEndTime) {
        return failure("Impossible de calculer les horaires", 400);
      }

      const mentorConflict = await this.checkMentorTimeConflict(
        mentorId,
        workshopId,
        newStartTime,
        newEndTime
      );

      if (mentorConflict) {
        return mentorConflict;
      }

      if (!isVirtual && newLocation) {
        const locationConflict = await this.checkLocationConflict(
          workshopId,
          newLocation,
          newStartTime,
          newEndTime
        );

        if (locationConflict) {
          return locationConflict;
        }
      }

      return success({ hasConflict: false });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("checkResourceConflicts", {
          resourceId: workshopId,
          details: { mentorId, newDate, newTime },
        })
      );
    }
  }

  private async checkMentorTimeConflict(
    mentorId: string,
    workshopId: string,
    newStartTime: Date,
    newEndTime: Date
  ): Promise<Result<{ hasConflict: boolean; conflictMessage?: string }> | null> {
    const mentorWorkshops = await this.workshopRepository.findByCreatorId(mentorId);

    for (const workshop of mentorWorkshops) {
      if (!isWorkshopValidForConflictCheck(workshop, workshopId)) {
        continue;
      }

      const { startTime, endTime } = calculateWorkshopTimeRange(workshop);
      if (!startTime || !endTime) continue;

      if (doTimeRangesOverlap(newStartTime, newEndTime, startTime, endTime)) {
        return success({
          hasConflict: true,
          conflictMessage: `Vous avez déjà un atelier prévu à cette date/heure : "${workshop.title}"`,
        });
      }
    }

    return null;
  }

  private async checkLocationConflict(
    workshopId: string,
    newLocation: string,
    newStartTime: Date,
    newEndTime: Date
  ): Promise<Result<{ hasConflict: boolean; conflictMessage?: string }> | null> {
    const publishedWorkshops = await this.workshopRepository.findPublished();

    for (const workshop of publishedWorkshops) {
      if (
        !isWorkshopValidForConflictCheck(workshop, workshopId) ||
        workshop.isVirtual ||
        !workshop.location ||
        workshop.location.toLowerCase().trim() !== newLocation.toLowerCase().trim()
      ) {
        continue;
      }

      const { startTime, endTime } = calculateWorkshopTimeRange(workshop);
      if (!startTime || !endTime) continue;

      if (doTimeRangesOverlap(newStartTime, newEndTime, startTime, endTime)) {
        return success({
          hasConflict: true,
          conflictMessage: `Le lieu "${newLocation}" est déjà réservé à cette date/heure pour l'atelier "${workshop.title}"`,
        });
      }
    }

    return null;
  }
}
