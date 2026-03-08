import type {
  IUpdateProfileService,
  UpdatePublicProfileInput,
} from "./update-profile.service.interface";
import type { IAuthUserRepository } from "../../../repositories/auth/auth-user.repository.interface";
import type { AppUserRepository } from "../../../repositories";
import { Result, failure, success } from "../../../../common";
import {
  PROFILE_VALIDATION,
  PROFILE_ERROR_MESSAGES,
} from "../../../../../shared/validation/profile.constants";

export class UpdateProfileService implements IUpdateProfileService {
  constructor(
    private readonly authUserRepository: IAuthUserRepository,
    private readonly appUserRepository: AppUserRepository
  ) {}

  async updatePublicProfile(
    userId: string,
    input: UpdatePublicProfileInput
  ): Promise<Result<{ success: boolean }>> {
    try {
      if (input.bio !== undefined && input.bio !== null) {
        if (input.bio.length > PROFILE_VALIDATION.bio.max) {
          return failure(PROFILE_ERROR_MESSAGES.bio.max, 400);
        }
      }

      if (input.photoUrl !== undefined && input.photoUrl !== null) {
        if (
          typeof input.photoUrl !== "string" ||
          input.photoUrl.trim() === ""
        ) {
          return failure("Invalid photo URL", 400);
        }
      }

      if (input.name !== undefined) {
        await this.authUserRepository.updateName(userId, input.name);
      }

      const appUser = await this.appUserRepository.findByUserId(userId);

      if (appUser) {
        const updateData: any = {};

        if (input.bio !== undefined) {
          updateData.bio = input.bio || null;
        }

        if (input.photoUrl !== undefined) {
          updateData.photoUrl = input.photoUrl || null;
        }

        if (input.emailNotifications !== undefined) {
          updateData.emailNotifications = input.emailNotifications;
        }

        if (input.inAppNotifications !== undefined) {
          updateData.inAppNotifications = input.inAppNotifications;
        }

        if (Object.keys(updateData).length > 0) {
          await this.appUserRepository.update(userId, updateData);
        }
      }

      return success({ success: true });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return failure(`Failed to update profile: ${errorMessage}`, 500);
    }
  }
}
