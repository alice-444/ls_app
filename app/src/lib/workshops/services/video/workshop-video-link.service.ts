import type { IWorkshopVideoLinkService } from "./workshop-video-link.service.interface";
import type { IWorkshopRepository, WorkshopEntity } from "../../repositories/workshop.repository.interface";
import { WorkshopDomain } from "../../domain/workshop.domain";
import { logger } from "../../../common/logger";

export class WorkshopVideoLinkService implements IWorkshopVideoLinkService {
  private readonly TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

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
    return timeUntilStart >= 0 && timeUntilStart <= this.TWELVE_HOURS_MS;
  }

  shouldExposeLink(
    workshop: WorkshopEntity,
    currentTime: Date = new Date()
  ): boolean {
    if (!workshop.isVirtual) {
      return false;
    }

    // Expose the link from 3 hours before start through end of workshop
    return WorkshopDomain.isLive(workshop, 180, currentTime);
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
