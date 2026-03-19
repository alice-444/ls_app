import type { WorkshopResponseDTO } from "../dto/workshop.dto";
import { mapWorkshopToDTO } from "../dto/workshop.dto";
import type { WorkshopEntity } from "../repositories/workshop.repository.interface";
import type { IWorkshopVideoLinkService } from "../services/video/workshop-video-link.service.interface";

export function mapWorkshopToPublicDTO(
  workshop: WorkshopEntity,
  videoLinkService: IWorkshopVideoLinkService,
): WorkshopResponseDTO {
  return mapWorkshopToDTO(videoLinkService.filterVideoLink(workshop));
}

export function mapWorkshopsToPublicDTOs(
  workshops: WorkshopEntity[],
  videoLinkService: IWorkshopVideoLinkService,
): WorkshopResponseDTO[] {
  return workshops.map((w) => mapWorkshopToPublicDTO(w, videoLinkService));
}
