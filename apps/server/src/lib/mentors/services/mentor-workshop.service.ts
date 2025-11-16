import type { Result } from "../../common";
import { failure, success } from "../../common";
import type { IMentorWorkshopService } from "./mentor-workshop.service.interface";
import type { IMentorRepository } from "../repositories/mentor.repository.interface";

export class MentorWorkshopService implements IMentorWorkshopService {
  constructor(private readonly mentorRepository: IMentorRepository) {}

  private async verifyMentorAccess(mentorId: string): Promise<Result<any>> {
    const mentor = await this.mentorRepository.findMentorById(mentorId);

    if (!mentor) {
      return failure("Mentor introuvable", 404);
    }

    return success({ mentor });
  }

  private calculateAverageRating(ratings: number[]): number {
    if (ratings.length === 0) return 0;
    return ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
  }

  async getMentorPublicWorkshops(mentorId: string): Promise<Result<any>> {
    try {
      const mentorCheck = await this.verifyMentorAccess(mentorId);
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
          ratings.length > 0 ? this.calculateAverageRating(ratings) : null;

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
          averageRating: averageRating
            ? Math.round(averageRating * 10) / 10
            : null,
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
      return failure((error as Error).message, 500);
    }
  }
}
