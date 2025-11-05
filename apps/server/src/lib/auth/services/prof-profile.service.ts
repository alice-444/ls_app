import { z } from "zod";
import { existsSync } from "fs";
import { join, resolve } from "path";
import { Result, failure, success, validateInput, prisma } from "../../common";
import type { AppUserRepository } from "../../users/repositories";
import { sanitizeString } from "../../utils/sanitize";

export const profProfileSchema = z.object({
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
  calendlyLink: z
    .string()
    .url("Lien Calendly invalide")
    .optional()
    .nullable()
    .refine((val) => {
      if (!val) return true;
      const calendlyRegex =
        /^https:\/\/(www\.)?calendly\.com\/[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)?(\?.*)?$/;
      return calendlyRegex.test(val);
    }, "Le lien doit être un lien Calendly valide (format: https://calendly.com/votre-nom)"),
});

export type ProfProfileInput = z.infer<typeof profProfileSchema>;

export class ProfProfileService {
  constructor(private readonly appUserRepository: AppUserRepository) {}

  async saveProfile(
    userId: string,
    input: unknown
  ): Promise<Result<{ success: boolean }>> {
    // Validation
    const validation = validateInput(profProfileSchema, input);
    if (!validation.ok) {
      return validation;
    }

    try {
      // Verify that the user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return failure("User not found", 404);
      }

      // Check AppUser exists and has PROF role
      const appUser = await this.appUserRepository.findByUserId(userId);

      if (!appUser) {
        return failure(
          "AppUser not found. Please complete role selection first.",
          400
        );
      }

      if (appUser.role !== "PROF") {
        return failure("Only users with PROF role can create a profile", 403);
      }

      // Verify that the user is in ACTIVE status
      if (appUser.status !== "ACTIVE") {
        return failure("User account is not active", 403);
      }

      // Validate photoUrl if provided
      let validatedPhotoUrl: string | null | undefined = undefined;
      if (validation.data.photoUrl) {
        const photoUrl = validation.data.photoUrl;

        // Verify that the URL points to the protected API endpoint
        if (!photoUrl.startsWith("/api/profile/photo/")) {
          return failure(
            "Invalid photo URL. Must be from /api/profile/photo/ endpoint",
            400
          );
        }

        // Extract filename from API endpoint
        const fileName = photoUrl.replace("/api/profile/photo/", "");
        if (!fileName) {
          return failure("Invalid photo URL format", 400);
        }

        const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "");
        if (sanitizedFileName !== fileName) {
          return failure("Invalid characters in file name", 400);
        }

        // The format is: userId-uuid.extension
        // UUID v4 always has 36 characters (format: 8-4-4-4-12)
        // Verify the extension
        const extensionMatch = sanitizedFileName.match(/\.(jpg|jpeg|png)$/);
        if (!extensionMatch) {
          return failure("Invalid file extension", 400);
        }

        // Remove the extension to get: userId-uuid
        const nameWithoutExt = sanitizedFileName.replace(
          /\.(jpg|jpeg|png)$/,
          ""
        );

        // Verify the UUID format (36 characters with dashes)
        const uuidPattern =
          /^(.+)-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;
        const match = nameWithoutExt.match(uuidPattern);

        if (!match) {
          return failure(
            "Invalid file name format. Expected: userId-uuid",
            400
          );
        }

        const userIdFromFileName = match[1]; // Group 1 : userId

        // Verify that the userId in the file name corresponds to the user
        if (userIdFromFileName !== userId) {
          return failure("Photo URL does not belong to this user", 403);
        }

        // Verify that the file actually exists
        const uploadsDir = resolve(process.cwd(), "uploads", "profiles");
        const filePath = join(uploadsDir, sanitizedFileName);

        const resolvedPath = resolve(filePath);
        if (!resolvedPath.startsWith(resolve(uploadsDir))) {
          return failure("Invalid file path", 400);
        }

        if (!existsSync(filePath)) {
          return failure("Photo file not found", 404);
        }

        validatedPhotoUrl = photoUrl;
      }

      // Sanitize text inputs to prevent XSS
      const sanitizedName = sanitizeString(validation.data.name);
      const sanitizedBio = sanitizeString(validation.data.bio);
      const sanitizedDomain = sanitizeString(validation.data.domain);
      const sanitizedQualifications = validation.data.qualifications
        ? sanitizeString(validation.data.qualifications)
        : null;
      const sanitizedExperience = validation.data.experience
        ? sanitizeString(validation.data.experience)
        : null;

      // Update User name (sanitized)
      await prisma.user.update({
        where: { id: userId },
        data: {
          name: sanitizedName,
        },
      });

      // Update AppUser with profile data
      const updateData: any = {
        bio: sanitizedBio,
        domain: sanitizedDomain,
        qualifications: sanitizedQualifications,
        experience: sanitizedExperience,
        socialMediaLinks:
          (validation.data.socialMediaLinks as Record<string, string>) || null,
        areasOfExpertise: validation.data.areasOfExpertise,
        mentorshipTopics: validation.data.mentorshipTopics || null,
        calendlyLink: validation.data.calendlyLink || null,
      };
      
      if (validatedPhotoUrl !== undefined) {
        updateData.photoUrl = validatedPhotoUrl;
      }
      
      await this.appUserRepository.update(userId, updateData);

      return success({ success: true });
    } catch (error) {
      return failure((error as Error).message, 500);
    }
  }

  async publishProfile(
    userId: string
  ): Promise<Result<{ success: boolean; publishedAt: Date }>> {
    try {
      // Verify that the user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return failure("User not found", 404);
      }

      // Check AppUser exists and has PROF role
      const appUser = await this.appUserRepository.findByUserId(userId);

      if (!appUser) {
        return failure(
          "AppUser not found. Please complete role selection first.",
          400
        );
      }

      if (appUser.role !== "PROF") {
        return failure("Only users with PROF role can publish a profile", 403);
      }

      // Verify that the user is in ACTIVE status
      if (appUser.status !== "ACTIVE") {
        return failure("User account is not active", 403);
      }

      // Verify required fields are present by querying the full profile
      const fullProfile = await prisma.appUser.findUnique({
        where: { userId },
        select: { bio: true, domain: true },
      });

      if (!fullProfile?.bio || !fullProfile?.domain) {
        return failure(
          "Profile must have bio and domain before publishing",
          400
        );
      }

      const publishedAt = new Date();

      // Update AppUser with published status
      await this.appUserRepository.update(userId, {
        isPublished: true,
        publishedAt,
      });

      return success({ success: true, publishedAt });
    } catch (error) {
      return failure((error as Error).message, 500);
    }
  }

  async unpublishProfile(
    userId: string
  ): Promise<Result<{ success: boolean }>> {
    try {
      // Verify that the user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return failure("User not found", 404);
      }

      // Check AppUser exists and has PROF role
      const appUser = await this.appUserRepository.findByUserId(userId);

      if (!appUser) {
        return failure(
          "AppUser not found. Please complete role selection first.",
          400
        );
      }

      if (appUser.role !== "PROF") {
        return failure(
          "Only users with PROF role can unpublish a profile",
          403
        );
      }

      // Update AppUser with unpublished status
      await this.appUserRepository.update(userId, {
        isPublished: false,
        publishedAt: null,
      });

      return success({ success: true });
    } catch (error) {
      return failure((error as Error).message, 500);
    }
  }
}
