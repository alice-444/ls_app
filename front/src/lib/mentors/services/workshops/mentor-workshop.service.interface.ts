import type { Result } from "../../../common";
import type { WorkshopResponseDTO } from "../../../workshops/dto/workshop.dto";

export interface IMentorWorkshopService {
  getMentorPublicWorkshops(mentorId: string): Promise<Result<{
    upcoming: WorkshopResponseDTO[];
    past: WorkshopResponseDTO[];
  }>>;
}
