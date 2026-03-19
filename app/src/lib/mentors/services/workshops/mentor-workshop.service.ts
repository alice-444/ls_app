import type { Result } from "../../../common";
import { success } from "../../../common";
import { handleError, createErrorContext } from "../../../common/error-handler";
import type { IMentorWorkshopService } from "./mentor-workshop.service.interface";
import type { IMentorRepository } from "../../repositories/mentor.repository.interface";
import {
  verifyMentorAccess,
  calculateAverageRating,
} from "../../utils/mentor-helpers";
import { WorkshopResponseDTO, mapWorkshopToDTO } from "../../../workshops/dto/workshop.dto";

export class MentorWorkshopService implements IMentorWorkshopService {
  constructor(private readonly mentorRepository: IMentorRepository) {}

  async getMentorPublicWorkshops(mentorId: string): Promise<Result<{
    upcoming: WorkshopResponseDTO[];
    past: WorkshopResponseDTO[];
  }>> {
    try {
      const mentorCheck = await verifyMentorAccess(
        this.mentorRepository,
        mentorId
      );
      if (!mentorCheck.ok) {
        return mentorCheck as any;
      }

      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const workshops = await this.mentorRepository.findMentorPublicWorkshops(
        mentorId
      );

      const upcoming: WorkshopResponseDTO[] = [];
      const past: WorkshopResponseDTO[] = [];

      for (const workshop of workshops) {
        const workshopDate = workshop.date ? new Date(workshop.date) : null;
        const isPast = workshopDate && workshopDate < now;

        const feedbacks = workshop.feedbacks || [];
        const ratings = feedbacks.map((f: any) => f.rating);
        const averageRating =
          ratings.length > 0 ? calculateAverageRating(ratings) : null;

        const workshopDTO = mapWorkshopToDTO({
          ...workshop,
          feedbackCount: feedbacks.length,
          averageRating,
        });

        if (isPast) {
          past.push(workshopDTO);
        } else {
          upcoming.push(workshopDTO);
        }
      }

      return success({
        upcoming,
        past,
      });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("getMentorPublicWorkshops", {
          resourceId: mentorId,
        })
      );
    }
  }
}
