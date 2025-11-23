import type { Result } from "../../common";
import { failure, success } from "../../common";
import type { IMentorFeedbackService } from "./mentor-feedback.service.interface";
import type { IMentorRepository } from "../repositories/mentor.repository.interface";

export class MentorFeedbackService implements IMentorFeedbackService {
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

  async getMentorFeedbacks(
    mentorId: string,
    filters?: {
      workshopId?: string;
    }
  ): Promise<Result<any>> {
    try {
      const mentorCheck = await this.verifyMentorAccess(mentorId);
      if (!mentorCheck.ok) {
        return mentorCheck;
      }

      const feedbacks = await this.mentorRepository.findMentorFeedbacks(
        mentorId,
        filters
      );

      const ratings = feedbacks.map((f) => f.rating);
      const averageRating = this.calculateAverageRating(ratings);
      const ratingCount = ratings.length;
      const ratingDistribution = [1, 2, 3, 4, 5].map((star) => ({
        star,
        count: ratings.filter((r: number) => r === star).length,
      }));

      return success({
        feedbacks: feedbacks.map((f) => ({
          id: f.id,
          rating: f.rating,
          comment: f.comment,
          isAnonymous: f.isAnonymous,
          createdAt: f.createdAt,
          apprentice: f.isAnonymous
            ? {
                id: null,
                name: "Anonyme",
              }
            : {
                id: f.apprentice?.user?.id || null,
                name: f.apprentice?.user?.name || "Anonyme",
              },
        })),
        aggregate: {
          averageRating: Math.round(averageRating * 10) / 10,
          totalCount: ratingCount,
          ratingDistribution,
        },
      });
    } catch (error) {
      return failure((error as Error).message, 500);
    }
  }
}

