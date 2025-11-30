import type { Result } from "../../common";
import { failure, success } from "../../common";
import { handleError, createErrorContext } from "../../common/error-handler";
import type { IMentorProfileService } from "./mentor-profile.service.interface";
import type { IMentorRepository } from "../../repositories/mentor.repository.interface";
import { verifyMentorAccess } from "../../utils/mentor-helpers";

export class MentorProfileService implements IMentorProfileService {
  constructor(private readonly mentorRepository: IMentorRepository) {}

  async getPublishedMentorById(mentorId: string): Promise<Result<any>> {
    try {
      const mentorCheck = await verifyMentorAccess(this.mentorRepository, mentorId);
      if (!mentorCheck.ok) {
        return mentorCheck;
      }

      const mentor = await this.mentorRepository.findPublishedMentorById(
        mentorId
      );

      if (!mentor) {
        return failure("Mentor introuvable", 404);
      }

      return success({
        id: mentor.id,
        userId: mentor.userId,
        name: mentor.user?.name || null,
        email: mentor.user?.email || null,
        bio: mentor.bio || null,
        domain: mentor.domain || null,
        photoUrl: mentor.photoUrl || null,
        qualifications: mentor.qualifications || null,
        experience: mentor.experience || null,
        socialMediaLinks: mentor.socialMediaLinks || null,
        areasOfExpertise: mentor.areasOfExpertise || null,
        mentorshipTopics: mentor.mentorshipTopics || null,
        calendlyLink: mentor.calendlyLink || null,
        publishedAt: mentor.publishedAt || null,
      });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("getPublishedMentorById", {
          resourceId: mentorId,
        })
      );
    }
  }
}
