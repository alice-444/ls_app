import type { Result } from "../../../common";
import { failure, success } from "../../../common";
import { handleError, createErrorContext } from "../../../common/error-handler";
import type { IMentorProfileService } from "./mentor-profile.service.interface";
import type { IMentorRepository } from "../../repositories/mentor.repository.interface";
import type { IUserBlockService } from "../../../../lib/users/services/moderation/user-block.service.interface";
import { verifyMentorAccess } from "../../utils/mentor-helpers";

export class MentorProfileService implements IMentorProfileService {
  constructor(
    private readonly mentorRepository: IMentorRepository,
    private readonly userBlockService: IUserBlockService
  ) {}

  async getPublicProfile(mentorId: string, viewerUserId?: string): Promise<Result<any>> {
    try {
      const mentorCheck = await verifyMentorAccess(this.mentorRepository, mentorId);
      if (!mentorCheck.ok) {
        return mentorCheck;
      }

      // Autoriser le mentor à voir son propre profil même s'il n'est pas publié
      let mentor = await this.mentorRepository.findPublishedMentorById(mentorId);
      
      const workshops = await this.mentorRepository.findMentorPublicWorkshops(
        mentorId
      );

      if (!mentor) {
        // Fallback: Si le mentor n'est pas "publié" mais qu'il a des ateliers publics, on l'affiche quand même
        const potentialMentor = await this.mentorRepository.findMentorById(mentorId);
        
        if (potentialMentor) {
          const isSelf = potentialMentor.userId === viewerUserId;
          const hasPublicWorkshops = workshops.length > 0;
          
          if (isSelf || hasPublicWorkshops) {
            mentor = potentialMentor;
          }
        }
      }

      if (!mentor) {
        return failure("Mentor introuvable", 404);
      }

      // Check for blocks if viewer is logged in
      if (viewerUserId) {
        const blockResult = await this.userBlockService.areUsersBlocked(
          viewerUserId,
          mentor.userId
        );
        if (blockResult.ok && (blockResult.data.user1BlockedUser2 || blockResult.data.user2BlockedUser1)) {
          return failure("Ce profil n'est plus accessible", 403);
        }
      }

      return success({
        id: mentor.id,
        userId: mentor.userId,
        name: mentor.name || null,
        displayName: mentor.displayName || mentor.name || null,
        bio: mentor.bio || null,
        domain: mentor.domain || null,
        photoUrl: mentor.photoUrl || null,
        qualifications: mentor.qualifications || null,
        experience: mentor.experience || null,
        socialMediaLinks: mentor.socialMediaLinks || null,
        areasOfExpertise: mentor.areasOfExpertise || null,
        mentorshipTopics: mentor.mentorshipTopics || null,
        publishedAt: mentor.publishedAt || null,
        workshops: workshops.map(w => ({
          id: w.id,
          title: w.title,
          description: w.description,
          date: w.date,
          time: w.time,
          duration: w.duration,
          location: w.location,
          isVirtual: w.isVirtual,
          maxParticipants: w.maxParticipants,
          status: w.status,
        })),
      });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("getPublicProfile", {
          resourceId: mentorId,
        })
      );
    }
  }

  async getPublicMentors(filters?: {
    domain?: string;
    topic?: string;
    limit?: number;
    cursor?: string;
  }): Promise<Result<{ mentors: any[]; nextCursor?: string }>> {
    try {
      const mentors = await this.mentorRepository.findPublicMentors(filters);

      const mentorsWithWorkshopsCount = await Promise.all(
        mentors.map(async mentor => {
          const workshops = await this.mentorRepository.findMentorPublicWorkshops(
            mentor.id
          );
          return {
            id: mentor.id,
            name: mentor.name,
            displayName: mentor.displayName || mentor.name,
            bio: mentor.bio,
            domain: mentor.domain,
            photoUrl: mentor.photoUrl,
            areasOfExpertise: mentor.areasOfExpertise,
            mentorshipTopics: mentor.mentorshipTopics,
            workshopsCount: workshops.length,
          };
        })
      );

      let nextCursor: string | undefined;
      if (mentors.length === (filters?.limit || 20)) {
        nextCursor = mentors[mentors.length - 1].id;
      }

      return success({
        mentors: mentorsWithWorkshopsCount,
        nextCursor,
      });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("getPublicMentors", {
          details: filters as Record<string, unknown>,
        })
      );
    }
  }
}
