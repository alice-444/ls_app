import type { Result } from "../../common";
import { success } from "../../common";
import { handleError, createErrorContext } from "../../common/error-handler";
import type { IMentorFeedbackService } from "./mentor-feedback.service.interface";
import type { IMentorRepository } from "../repositories/mentor.repository.interface";
import {
  verifyMentorAccess,
  calculateAverageRating,
} from "../utils/mentor-helpers";

export class MentorFeedbackService implements IMentorFeedbackService {
  constructor(private readonly mentorRepository: IMentorRepository) {}

  async getMentorFeedbacks(
    mentorId: string,
    filters?: {
      workshopId?: string;
    }
  ): Promise<Result<any>> {
    try {
      const mentorCheck = await verifyMentorAccess(
        this.mentorRepository,
        mentorId
      );
      if (!mentorCheck.ok) {
        return mentorCheck;
      }

      const feedbacks = await this.mentorRepository.findMentorFeedbacks(
        mentorId,
        filters
      );

      const ratings = feedbacks.map((f) => f.rating);
      const averageRating = calculateAverageRating(ratings);
      const ratingCount = ratings.length;
      const ratingDistribution = [1, 2, 3, 4, 5].map((star) => ({
        star,
        count: ratings.filter((r: number) => r === star).length,
      }));

      return success({
        feedbacks: feedbacks.map((f) => {
          const firstName = f.apprentice?.user?.name
            ? f.apprentice.user.name.split(" ")[0]
            : null;
          return {
            id: f.id,
            rating: f.rating,
            comment: f.comment,
            isAnonymous: f.isAnonymous,
            createdAt: f.createdAt,
            apprentice: f.isAnonymous
              ? {
                  id: null,
                  name: "Étudiant anonyme",
                  firstName: "Étudiant anonyme",
                  image: null,
                }
              : {
                  id: f.apprentice?.user?.id || null,
                  name: f.apprentice?.user?.name || "Anonyme",
                  firstName: firstName || "Anonyme",
                  image: f.apprentice?.user?.image || null,
                },
          };
        }),
        aggregate: {
          averageRating,
          totalCount: ratingCount,
          ratingDistribution,
        },
      });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("getMentorFeedbacks", {
          resourceId: mentorId,
          details: { workshopId: filters?.workshopId },
        })
      );
    }
  }
}
