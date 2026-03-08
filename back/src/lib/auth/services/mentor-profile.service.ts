import { z } from "zod";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { Result, failure, success, validateInput, prisma } from "../../common";
import { handleError, createErrorContext } from "../../common/error-handler";
import type { AppUserRepository } from "../../users/repositories";
import { sanitizeString } from "../../utils/sanitize";
import { verifyUserExists, verifyMentorUser } from "./user-helpers";

export const mentorProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(40, "Le nom ne peut pas dépasser 40 caractères"),
  bio: z
    .string()
    .trim()
    .min(20, "La bio doit contenir au moins 20 caractères")
    .max(250, "La bio ne peut pas dépasser 250 caractères"),
  domain: z
    .string()
    .trim()
    .min(2, "Le domaine doit contenir au moins 2 caractères")
    .max(60, "Le domaine ne peut pas dépasser 60 caractères"),
  photoUrl: z.union([z.string(), z.null(), z.undefined()]).optional(),
  qualifications: z
    .string()
    .trim()
    .max(500, "Les qualifications ne peuvent pas dépasser 500 caractères")
    .optional()
    .nullable(),
  experience: z
    .string()
    .trim()
    .max(700, "L'expérience ne peut pas dépasser 700 caractères")
    .optional()
    .nullable(),
  socialMediaLinks: z
    .record(
      z.enum(["linkedin", "twitter", "youtube", "github"]),
      z.string().url("URL invalide")
    )
    .optional()
    .nullable(),
  areasOfExpertise: z
    .array(z.string().trim().min(1).max(50))
    .min(1, "Au moins un domaine d'expertise est requis")
    .max(10, "Maximum 10 domaines d'expertise"),
  mentorshipTopics: z
    .array(z.string().trim().min(1).max(50))
    .max(15, "Maximum 15 sujets")
    .optional()
    .nullable(),
  displayName: z
    .string()
    .trim()
    .max(50, "Le nom d'affichage ne peut pas dépasser 50 caractères")
    .optional()
    .nullable(),
  iceBreakerTags: z
    .array(z.string().trim().min(1).max(30))
    .max(5, "Maximum 5 tags d'ice-breaker")
    .optional()
    .nullable(),
});

export type MentorProfileInput = z.infer<typeof mentorProfileSchema>;

export class MentorProfileService {
  constructor(private readonly appUserRepository: AppUserRepository) {}

  private async validatePhotoUrl(
    photoUrl: string,
    userId: string
  ): Promise<Result<string>> {
    if (!photoUrl.startsWith("/api/profile/photo/")) {
      return failure(
        "Invalid photo URL. Must be from /api/profile/photo/ endpoint",
        400
      );
    }

    const fileName = photoUrl.replace("/api/profile/photo/", "");
    if (!fileName) {
      return failure("Invalid photo URL format", 400);
    }

    const sanitizedFileName = fileName.replaceAll(/[^a-zA-Z0-9._-]/, "");
    if (sanitizedFileName !== fileName) {
      return failure("Invalid characters in file name", 400);
    }

    const extensionMatch = sanitizedFileName.match(/\.(jpg|jpeg|png)$/);
    if (!extensionMatch) {
      return failure("Invalid file extension", 400);
    }

    const nameWithoutExt = sanitizedFileName.replace(/\.(jpg|jpeg|png)$/, "");
    const uuidPattern =
      /^(.+)-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;
    const match = nameWithoutExt.match(uuidPattern);

    if (!match) {
      return failure("Invalid file name format. Expected: userId-uuid", 400);
    }

    const userIdFromFileName = match[1];
    if (userIdFromFileName !== userId) {
      return failure("Photo URL does not belong to this user", 403);
    }

    const uploadsDir = resolve(process.cwd(), "uploads", "profiles");
    const filePath = join(uploadsDir, sanitizedFileName);
    const resolvedPath = resolve(filePath);

    if (!resolvedPath.startsWith(resolve(uploadsDir))) {
      return failure("Invalid file path", 400);
    }

    if (!existsSync(filePath)) {
      return failure("Photo file not found", 404);
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
    photoUrl?: string
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
    input: unknown
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

      const mentorCheck = await verifyMentorUser(this.appUserRepository, userId);
      if (!mentorCheck.ok) {
        return mentorCheck;
      }

      let validatedPhotoUrl: string | undefined = undefined;
      if (validation.data.photoUrl) {
        const photoValidation = await this.validatePhotoUrl(
          validation.data.photoUrl,
          userId
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
        validatedPhotoUrl
      );

      await this.appUserRepository.update(userId, updateData);

      return success({ success: true });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("updateProfile", { userId })
      );
    }
  }

  async publishProfile(
    userId: string
  ): Promise<Result<{ success: boolean; publishedAt: Date }>> {
    try {
      const userCheck = await verifyUserExists(userId);
      if (!userCheck.ok) {
        return userCheck;
      }

      const mentorCheck = await verifyMentorUser(this.appUserRepository, userId);
      if (!mentorCheck.ok) {
        return mentorCheck;
      }

      const fullProfile = await prisma.user.findUnique({
        where: { userId: userId },
        select: { bio: true, domain: true },
      });

      if (!fullProfile?.bio || !fullProfile?.domain) {
        return failure(
          "Profile must have bio and domain before publishing",
          400
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
        createErrorContext("publishProfile", { userId })
      );
    }
  }

  async unpublishProfile(
    userId: string
  ): Promise<Result<{ success: boolean }>> {
    try {
      const userCheck = await verifyUserExists(userId);
      if (!userCheck.ok) {
        return userCheck;
      }

      const mentorCheck = await verifyMentorUser(this.appUserRepository, userId);
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
        createErrorContext("unpublishProfile", { userId })
      );
    }
  }
}
