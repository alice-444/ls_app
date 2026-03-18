import type { WorkshopEntity } from "../../repositories/workshop.repository.interface";

export interface IWorkshopVideoLinkService {
  shouldGenerateLink(workshop: WorkshopEntity, currentTime?: Date): boolean;

  shouldExposeLink(workshop: WorkshopEntity, currentTime?: Date): boolean;

  findWorkshopsEligibleForLinkGeneration(): Promise<WorkshopEntity[]>;

  filterVideoLink(workshop: WorkshopEntity): WorkshopEntity;
}
