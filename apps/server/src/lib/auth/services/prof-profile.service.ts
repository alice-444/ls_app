import { z } from "zod";
import { existsSync } from "fs";
import { join, resolve } from "path";
import { Result, failure, success, validateInput, prisma } from "../../common";
import type { AppUserRepository } from "../../users/repositories";

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

      // Validate photoUrl if provided
      let validatedPhotoUrl: string | null = null;
      if (validation.data.photoUrl) {
        const photoUrl = validation.data.photoUrl;

        if (!photoUrl.startsWith("/uploads/profiles/")) {
          return failure(
            "Invalid photo URL. Must be from /uploads/profiles/ directory",
            400
          );
        }

        const fileName = photoUrl.split("/").pop();
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
        const uuidFromFileName = match[2]; // Group 2 : UUID (optional verification)

        // Verify that the userId in the file name corresponds to the user
        if (userIdFromFileName !== userId) {
          return failure("Photo URL does not belong to this user", 403);
        }

        // Verify that the file actually exists
        const uploadsDir = resolve(
          process.cwd(),
          "public",
          "uploads",
          "profiles"
        );
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

      // Update User name
      await prisma.user.update({
        where: { id: userId },
        data: {
          name: validation.data.name,
        },
      });

      // Update AppUser with profile data
      await this.appUserRepository.update(userId, {
        bio: validation.data.bio,
        domain: validation.data.domain,
        photoUrl: validatedPhotoUrl,
      });

      return success({ success: true });
    } catch (error) {
      return failure((error as Error).message, 500);
    }
  }
}
