import { mentorProfileSchema, isValidPhotoUrl } from "@ls-app/shared";
import { MentorProfileInput } from "@ls-app/shared";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { Result, failure, success, validateInput, prisma } from "../../common";
import { handleError, createErrorContext } from "../../common/error-handler";
import type { AppUserRepository } from "../../users/repositories";
import { sanitizeString } from "../../utils/sanitize";
import { verifyUserExists, verifyMentorUser } from "./user-helpers";

export class MentorProfileService {
  constructor(private readonly appUserRepository: AppUserRepository) {}

  private async validatePhotoUrl(
    photoUrl: string,
    userId: string,
  ): Promise<Result<string>> {
    if (!isValidPhotoUrl(photoUrl, userId)) {
      return failure(
        "Invalid photo URL. Must be a secure Cloudinary URL or from /api/profile/photo/ endpoint belonging to you.",
        400,
      );
    }

    // For local files, we still check file existence on disk
    if (photoUrl.startsWith("/api/profile/photo/")) {
      const fileName = photoUrl.replace("/api/profile/photo/", "");
      const sanitizedFileName = fileName.replaceAll(/[^a-zA-Z0-9._-]/g, "");

      const uploadsDir = resolve(process.cwd(), "uploads", "profiles");
      const filePath = join(uploadsDir, sanitizedFileName);
      const resolvedPath = resolve(filePath);

      if (!resolvedPath.startsWith(resolve(uploadsDir))) {
        return failure("Invalid file path", 400);
      }

      if (!existsSync(filePath)) {
        return failure("Photo file not found", 404);
      }
    }

    return success(photoUrl);
  }

  private sanitizeProfileData(data: MentorProfileInput) {
    return {
      name: sanitizeString(data.name, { maxLength: 100, trim: true }),
      bio: sanitizeString(data.bio, { maxLength: 2000, trim: true }),
      domain: sanitizeString(data.domain, { maxLength: 100, trim: true }),
      qualifications: data.qualifications
        ? sanitizeString(data.qualifications, { maxLength: 2000, trim: true })
        : null,
      experience: data.experience
        ? sanitizeString(data.experience, { maxLength: 2000, trim: true })
        : null,
      displayName: data.displayName
        ? sanitizeString(data.displayName, { maxLength: 100, trim: true })
        : null,
    };
  }

  private buildUpdateData(
    sanitized: ReturnType<typeof this.sanitizeProfileData>,
    data: MentorProfileInput,
    photoUrl?: string,
  ) {
    const updateData: any = {
      bio: sanitized.bio,
      domain: sanitized.domain,
      qualifications: sanitized.qualifications,
      experience: sanitized.experience,
      socialMediaLinks:
        (data.socialMediaLinks as Record<string, string>) || null,
      areasOfExpertise: data.areasOfExpertise,
      mentorshipTopics: data.mentorshipTopics || null,
      displayName: sanitized.displayName,
      iceBreakerTags: data.iceBreakerTags || null,
    };

    if (photoUrl !== undefined) {
      updateData.photoUrl = photoUrl;
    }

    return updateData;
  }

  async saveProfile(
    userId: string,
    input: unknown,
  ): Promise<Result<{ success: boolean }>> {
    const validation = validateInput(mentorProfileSchema, input);
    if (!validation.ok) {
      return validation;
    }

    try {
      const userCheck = await verifyUserExists(userId);
      if (!userCheck.ok) {
        return userCheck;
      }

      const mentorCheck = await verifyMentorUser(
        this.appUserRepository,
        userId,
      );
      if (!mentorCheck.ok) {
        return mentorCheck;
      }

      let validatedPhotoUrl: string | undefined = undefined;
      if (validation.data.photoUrl) {
        const photoValidation = await this.validatePhotoUrl(
          validation.data.photoUrl,
          userId,
        );
        if (!photoValidation.ok) {
          return photoValidation;
        }
        validatedPhotoUrl = photoValidation.data;
      }

      const sanitized = this.sanitizeProfileData(validation.data);

      await prisma.user.update({
        where: { id: userId },
        data: { name: sanitized.name },
      });

      const updateData = this.buildUpdateData(
        sanitized,
        validation.data,
        validatedPhotoUrl,
      );

      await this.appUserRepository.update(userId, updateData);

      return success({ success: true });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("updateProfile", { userId }),
      );
    }
  }

  async publishProfile(
    userId: string,
  ): Promise<Result<{ success: boolean; publishedAt: Date }>> {
    try {
      const userCheck = await verifyUserExists(userId);
      if (!userCheck.ok) {
        return userCheck;
      }

      const mentorCheck = await verifyMentorUser(
        this.appUserRepository,
        userId,
      );
      if (!mentorCheck.ok) {
        return mentorCheck;
      }

      const fullProfile = await prisma.user.findUnique({
        where: { id: userId },
        select: { bio: true, domain: true },
      });

      if (!fullProfile?.bio || !fullProfile?.domain) {
        return failure(
          "Profile must have bio and domain before publishing",
          400,
        );
      }

      const publishedAt = new Date();

      await this.appUserRepository.update(userId, {
        isPublished: true,
        publishedAt,
      });

      return success({ success: true, publishedAt });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("publishProfile", { userId }),
      );
    }
  }

  async unpublishProfile(
    userId: string,
  ): Promise<Result<{ success: boolean }>> {
    try {
      const userCheck = await verifyUserExists(userId);
      if (!userCheck.ok) {
        return userCheck;
      }

      const mentorCheck = await verifyMentorUser(
        this.appUserRepository,
        userId,
      );
      if (!mentorCheck.ok) {
        return mentorCheck;
      }

      await this.appUserRepository.update(userId, {
        isPublished: false,
        publishedAt: null,
      });

      return success({ success: true });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("unpublishProfile", { userId }),
      );
    }
  }
}
