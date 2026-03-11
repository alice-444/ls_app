import type { IWorkshopVideoLinkService } from "./workshop-video-link.service.interface";
import type { IWorkshopRepository, WorkshopEntity } from "../../repositories/workshop.repository.interface";
import { WorkshopDomain } from "../../domain/workshop.domain";
import { logger } from "../../../common/logger";

export class WorkshopVideoLinkService implements IWorkshopVideoLinkService {
  private readonly TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
  private readonly THREE_HOURS_MS = 3 * 60 * 60 * 1000;
  private readonly TIME_WINDOW_MS = 30 * 60 * 1000; // ±30 minutes

  constructor(private readonly workshopRepository: IWorkshopRepository) {}

  private calculateWorkshopStartTime(workshop: WorkshopEntity): Date | null {
    if (!workshop.date || !workshop.time) {
      return null;
    }

    try {
      const workshopDate = new Date(workshop.date);
      const [hours, minutes] = workshop.time.split(":").map(Number);
      workshopDate.setHours(hours, minutes, 0, 0);
      return workshopDate;
    } catch (error) {
      logger.warn("Failed to parse workshop date/time", { workshopId: workshop.id, error });
      return null;
    }
  }

  shouldGenerateLink(
    workshop: WorkshopEntity,
    currentTime: Date = new Date()
  ): boolean {
    if (!workshop.isVirtual || !workshop.date || !workshop.time) {
      return false;
    }

    const startTime = this.calculateWorkshopStartTime(workshop);
    if (!startTime) {
      return false;
    }

    const timeUntilStart = startTime.getTime() - currentTime.getTime();
    const lowerBound = this.TWELVE_HOURS_MS - this.TIME_WINDOW_MS;
    const upperBound = this.TWELVE_HOURS_MS + this.TIME_WINDOW_MS;

    return timeUntilStart >= lowerBound && timeUntilStart <= upperBound;
  }

  shouldExposeLink(
    workshop: WorkshopEntity
  ): boolean {
    if (!workshop.isVirtual) {
      return false;
    }

    // Standard window for exposing the link is 3 hours before start
    return WorkshopDomain.isLive(workshop, 180);
  }

  async findWorkshopsEligibleForLinkGeneration(): Promise<WorkshopEntity[]> {
    const now = new Date();
    const allPublishedWorkshops = await this.workshopRepository.findPublished();

    return allPublishedWorkshops.filter((workshop) => {
      if (
        !workshop.isVirtual ||
        !workshop.date ||
        !workshop.time ||
        workshop.dailyRoomId
      ) {
        return false;
      }

      return this.shouldGenerateLink(workshop, now);
    });
  }

  filterVideoLink(workshop: WorkshopEntity): WorkshopEntity {
    const shouldExpose = this.shouldExposeLink(workshop);
    return {
      ...workshop,
      dailyRoomId: shouldExpose ? workshop.dailyRoomId : null,
    };
  }
}
