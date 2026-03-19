import type { Result } from "../../common";
import { failure, success } from "../../common";
import type { IMentorRepository } from "../repositories/mentor.repository.interface";
import type { MentorEntity } from "../repositories/mentor.repository.interface";

export async function verifyMentorAccess(
  mentorRepository: IMentorRepository,
  mentorId: string
): Promise<Result<{ mentor: MentorEntity }>> {
  const mentor = await mentorRepository.findMentorById(mentorId);

  if (!mentor) {
    return failure("Mentor introuvable", 404);
  }

  return success({ mentor });
}

export function calculateAverageRating(ratings: number[]): number {
  if (ratings.length === 0) return 0;
  const average = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
  return Math.round(average * 10) / 10;
}
