import { Result, failure, success } from "../../../common";
import { handleError, createErrorContext } from "../../../common/error-handler";
import type { AppUserRepository } from "../../repositories";
import type { IWorkshopRepository } from "../../../workshops/repositories/workshop.repository.interface";
import type { IUserConnectionRepository } from "../../repositories/connection/user-connection.repository.interface";
import type { IUserBlockService } from "../moderation/user-block.service.interface";
import { verifyUserExists } from "../../../auth/services/user-helpers";

export class ApprenticeProfileService {
  constructor(
    private readonly appUserRepository: AppUserRepository,
    private readonly workshopRepository: IWorkshopRepository,
    private readonly userConnectionRepository: IUserConnectionRepository,
    private readonly userBlockService: IUserBlockService
  ) {}

  async saveIdentityCard(
    userId: string,
    input: {
      displayName: string;
      studyDomain: string;
      studyProgram: string;
      bio?: string | null;
      photoUrl?: string | null;
      iceBreakerTags?: string[];
    }
  ): Promise<Result<{ success: boolean }>> {
    try {
      const userCheck = await verifyUserExists(userId);
      if (!userCheck.ok) {
        return userCheck;
      }

      const appUser = await this.appUserRepository.findByUserId(userId);
      if (!appUser) {
        return failure(
          "AppUser not found. Please complete role selection first.",
          400
        );
      }

      if (appUser.role !== "APPRENANT") {
        return failure("Only apprentices can update their identity card", 403);
      }

      if (input.iceBreakerTags && input.iceBreakerTags.length > 5) {
        return failure("Maximum 5 ice breaker tags allowed", 400);
      }

      await this.appUserRepository.update(userId, {
        displayName: input.displayName,
        studyDomain: input.studyDomain,
        studyProgram: input.studyProgram,
        bio: input.bio || null,
        photoUrl: input.photoUrl || null,
        iceBreakerTags: input.iceBreakerTags || [],
      });

      return success({ success: true });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("saveIdentityCard", { userId })
      );
    }
  }

  async updateProfile(
    userId: string,
    input: {
      studyDomain?: string;
      studyProgram?: string;
      displayName?: string;
      bio?: string;
    }
  ): Promise<Result<{ success: boolean }>> {
    try {
      const userCheck = await verifyUserExists(userId);
      if (!userCheck.ok) {
        return userCheck;
      }

      const appUser = await this.appUserRepository.findByUserId(userId);
      if (!appUser) {
        return failure(
          "AppUser not found. Please complete role selection first.",
          400
        );
      }

      if (appUser.role !== "APPRENANT") {
        return failure("Only apprentices can update their profile", 403);
      }

      await this.appUserRepository.update(userId, {
        displayName: input.displayName,
        studyDomain: input.studyDomain,
        studyProgram: input.studyProgram,
        bio: input.bio,
      });

      return success({ success: true });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("updateProfile", { userId })
      );
    }
  }

  async getIdentityCard(userId: string): Promise<
    Result<{
      displayName: string | null;
      studyDomain: string | null;
      studyProgram: string | null;
      bio: string | null;
      photoUrl: string | null;
      iceBreakerTags: string[];
      userName: string | null;
    }>
  > {
    try {
      const appUser = await this.appUserRepository.findByUserId(userId);
      if (!appUser) {
        return failure("AppUser not found", 404);
      }

      const identityCard =
        await this.appUserRepository.findIdentityCardByUserId(userId);
      const userName = await this.appUserRepository.findUserNameByUserId(
        userId
      );

      if (!identityCard) {
        return failure("Identity card not found", 404);
      }

      return success({
        displayName: identityCard.displayName,
        studyDomain: identityCard.studyDomain,
        studyProgram: identityCard.studyProgram,
        bio: (identityCard as any).bio || null,
        photoUrl: identityCard.photoUrl,
        iceBreakerTags: identityCard.iceBreakerTags || [],
        userName,
      });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("getIdentityCard", { userId })
      );
    }
  }

  async getMiniProfileForMentor(
    mentorUserId: string,
    apprenticeUserId: string
  ): Promise<
    Result<{
      displayName: string | null;
      studyDomain: string | null;
      studyProgram: string | null;
      bio: string | null;
      photoUrl: string | null;
      iceBreakerTags: string[];
    }>
  > {
    try {
      const mentorAppUser = await this.appUserRepository.findByUserId(
        mentorUserId
      );
      if (!mentorAppUser) {
        return failure("Mentor not found", 404);
      }

      if (mentorAppUser.role !== "MENTOR") {
        return failure("Only mentors can view apprentice mini-profiles", 403);
      }

      const apprenticeAppUser = await this.appUserRepository.findByUserId(
        apprenticeUserId
      );
      if (!apprenticeAppUser) {
        return failure("Apprentice not found", 404);
      }

      if (apprenticeAppUser.role !== "APPRENANT") {
        return failure("User is not an apprentice", 400);
      }

      const workshop =
        await this.workshopRepository.findWorkshopBetweenMentorAndApprentice(
          mentorAppUser.id,
          apprenticeAppUser.id
        );

      if (!workshop) {
        return failure(
          "Apprentice is not registered for any of your workshops",
          403
        );
      }

      const identityCard =
        await this.appUserRepository.findIdentityCardByUserId(apprenticeUserId);

      if (!identityCard) {
        return failure("Identity card not found", 404);
      }

      return success({
        displayName: identityCard.displayName,
        studyDomain: identityCard.studyDomain,
        studyProgram: identityCard.studyProgram,
        bio: (identityCard as any).bio || null,
        photoUrl: identityCard.photoUrl,
        iceBreakerTags: identityCard.iceBreakerTags || [],
      });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("getMiniProfileForMentor", {
          userId: mentorUserId,
          details: { apprenticeUserId },
        })
      );
    }
  }

  async getApprenticeProfileForViewer(
    viewerUserId: string,
    apprenticeUserId: string
  ): Promise<
    Result<{
      displayName: string | null;
      studyDomain: string | null;
      studyProgram: string | null;
      bio: string | null;
      photoUrl: string | null;
      iceBreakerTags: string[];
      hasFullAccess: boolean;
    }>
  > {
    try {
      // Check for blocks
      const blockResult = await this.userBlockService.areUsersBlocked(
        viewerUserId,
        apprenticeUserId
      );
      if (!blockResult.ok) return blockResult;
      if (blockResult.data.user1BlockedUser2 || blockResult.data.user2BlockedUser1) {
        return failure("Cannot view this profile", 403);
      }

      const viewerAppUser = await this.appUserRepository.findByUserId(
        viewerUserId
      );
      if (!viewerAppUser) {
        return failure("Viewer not found", 404);
      }

      const apprenticeAppUser = await this.appUserRepository.findByUserId(
        apprenticeUserId
      );
      if (!apprenticeAppUser) {
        return failure("Apprentice not found", 404);
      }

      if (apprenticeAppUser.role !== "APPRENANT") {
        return failure("User is not an apprentice", 400);
      }

      if (viewerUserId === apprenticeUserId) {
        const identityCard =
          await this.appUserRepository.findIdentityCardByUserId(
            apprenticeUserId
          );

        if (!identityCard) {
          return failure("Identity card not found", 404);
        }

        return success({
          displayName: identityCard.displayName,
          studyDomain: identityCard.studyDomain,
          studyProgram: identityCard.studyProgram,
          bio: (identityCard as any).bio || null,
          photoUrl: identityCard.photoUrl,
          iceBreakerTags: identityCard.iceBreakerTags || [],
          hasFullAccess: true,
        });
      }

      let hasMentorAccess = false;
      if (viewerAppUser.role === "MENTOR") {
        const workshop =
          await this.workshopRepository.findWorkshopBetweenMentorAndApprentice(
            viewerAppUser.id,
            apprenticeAppUser.id
          );

        if (workshop) {
          hasMentorAccess = true;
        }
      }

      const connection =
        await this.userConnectionRepository.findConnectionBetweenUsers(
          viewerAppUser.id,
          apprenticeAppUser.id
        );

      const isConnected = connection?.status === "ACCEPTED";
      const hasFullAccess = hasMentorAccess || isConnected;

      const identityCard =
        await this.appUserRepository.findIdentityCardByUserId(apprenticeUserId);

      if (!identityCard) {
        return failure("Identity card not found", 404);
      }

      return success({
        displayName: identityCard.displayName,
        studyDomain: hasFullAccess ? identityCard.studyDomain : null,
        studyProgram: hasFullAccess ? identityCard.studyProgram : null,
        bio: hasFullAccess ? (identityCard as any).bio || null : null,
        photoUrl: hasFullAccess ? identityCard.photoUrl : null,
        iceBreakerTags: hasFullAccess ? identityCard.iceBreakerTags || [] : [],
        hasFullAccess,
      });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("getApprenticeProfileForViewer", {
          userId: viewerUserId,
          details: { apprenticeUserId },
        })
      );
    }
  }
}
