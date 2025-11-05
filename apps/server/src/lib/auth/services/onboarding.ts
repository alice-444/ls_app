import { z } from "zod";
import { generateInternalId } from "../../utils/id-generator";
import { Result, failure, success, validateInput, prisma } from "../../common";
import type { AppUserRepository } from "../../users/repositories";

export const selectRoleSchema = z.object({
  role: z.enum(["PROF", "APPRENANT"]),
});

export type SelectRoleInput = z.infer<typeof selectRoleSchema>;

export class OnboardingService {
  constructor(private readonly appUserRepository: AppUserRepository) {}

  async selectRole(
    userId: string,
    input: unknown
  ): Promise<Result<{ role: string }>> {
    // Validation
    const validation = validateInput(selectRoleSchema, input);
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

      // Check or create AppUser
      let appUser = await this.appUserRepository.findByUserId(userId);

      if (!appUser) {
        // Create AppUser if it does not exist (in case registration did not create AppUser)
        appUser = await this.appUserRepository.create({
          id: generateInternalId(),
          userId,
          role: validation.data.role,
          status: "ACTIVE",
        });
      } else {
        // Verify that the user does not have a role assigned
        if (appUser.role !== null) {
          return failure(
            "Role already assigned. Cannot change role after onboarding.",
            403
          );
        }

        // Verify that the user is in PENDING status
        if (appUser.status !== "PENDING") {
          return failure(
            "User must be in PENDING status to select role",
            400
          );
        }

        // Update the role and activate the user
        appUser = await this.appUserRepository.update(userId, {
          role: validation.data.role,
          status: "ACTIVE",
        });
      }

      // Verify that the role has been assigned
      if (!appUser.role) {
        return failure("Failed to assign role", 500);
      }

      return success({ role: appUser.role });
    } catch (error) {
      return failure((error as Error).message, 500);
    }
  }
}
