import type { Result } from "../../common";
import { success } from "../../common";
import { handleError, createErrorContext } from "../../common/error-handler";
import type { IMentorWorkshopService } from "./mentor-workshop.service.interface";
import type { IMentorRepository } from "../../repositories/mentor.repository.interface";
import {
  verifyMentorAccess,
  calculateAverageRating,
} from "../../utils/mentor-helpers";

export class MentorWorkshopService implements IMentorWorkshopService {
  constructor(private readonly mentorRepository: IMentorRepository) {}

  async getMentorPublicWorkshops(mentorId: string): Promise<Result<any>> {
    try {
      const mentorCheck = await verifyMentorAccess(
        this.mentorRepository,
        mentorId
      );
      if (!mentorCheck.ok) {
        return mentorCheck;
      }

      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const workshops = await this.mentorRepository.findMentorPublicWorkshops(
        mentorId
      );

      const upcoming: any[] = [];
      const past: any[] = [];

      for (const workshop of workshops) {
        const workshopDate = workshop.date ? new Date(workshop.date) : null;
        const isPast = workshopDate && workshopDate < now;

        const feedbacks = workshop.feedbacks || [];
        const ratings = feedbacks.map((f) => f.rating);
        const averageRating =
          ratings.length > 0 ? calculateAverageRating(ratings) : null;

        const workshopData = {
          id: workshop.id,
          title: workshop.title,
          description: workshop.description,
          date: workshop.date,
          time: workshop.time,
          duration: workshop.duration,
          location: workshop.location,
          isVirtual: workshop.isVirtual,
          maxParticipants: workshop.maxParticipants,
          publishedAt: workshop.publishedAt,
          feedbackCount: feedbacks.length,
          averageRating,
        };

        if (isPast) {
          past.push(workshopData);
        } else {
          upcoming.push(workshopData);
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
