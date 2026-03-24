import type {
  IUpdateProfileService,
  UpdatePublicProfileInput,
} from "./update-profile.service.interface";
import type { IAuthUserRepository } from "../../../repositories/auth/auth-user.repository.interface";
import type { AppUserRepository } from "../../../repositories";
import type { Result } from "../../../../common";
import { failure, success } from "../../../../common";
import { PROFILE_VALIDATION, PROFILE_ERROR_MESSAGES } from "@ls-app/shared";

function validateBioInput(
  input: UpdatePublicProfileInput,
): Result<{ success: boolean }> | null {
  if (input.bio === undefined || input.bio === null) return null;
  if (input.bio.length > PROFILE_VALIDATION.bio.max) {
    return failure(PROFILE_ERROR_MESSAGES.bio.max, 400);
  }
  return null;
}

function validatePhotoUrlInput(
  input: UpdatePublicProfileInput,
): Result<{ success: boolean }> | null {
  if (input.photoUrl === undefined || input.photoUrl === null) return null;
  if (typeof input.photoUrl !== "string" || input.photoUrl.trim() === "") {
    return failure("Invalid photo URL", 400);
  }
  return null;
}

function buildAppUserUpdateData(
  input: UpdatePublicProfileInput,
): Record<string, unknown> {
  const updateData: Record<string, unknown> = {};

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

  return updateData;
}

export class UpdateProfileService implements IUpdateProfileService {
  constructor(
    private readonly authUserRepository: IAuthUserRepository,
    private readonly appUserRepository: AppUserRepository,
  ) {}

  async updatePublicProfile(
    userId: string,
    input: UpdatePublicProfileInput,
  ): Promise<Result<{ success: boolean }>> {
    try {
      const bioError = validateBioInput(input);
      if (bioError) return bioError;

      const photoError = validatePhotoUrlInput(input);
      if (photoError) return photoError;

      if (input.name !== undefined) {
        await this.authUserRepository.updateName(userId, input.name);
      }

      const appUser = await this.appUserRepository.findByUserId(userId);
      if (!appUser) {
        return success({ success: true });
      }

      const updateData = buildAppUserUpdateData(input);
      if (Object.keys(updateData).length > 0) {
        await this.appUserRepository.update(userId, updateData);
      }

      return success({ success: true });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return failure(`Failed to update profile: ${errorMessage}`, 500);
    }
  }
}
