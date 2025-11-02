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
        // Update the role and activate the user
        appUser = await this.appUserRepository.update(userId, {
          role: validation.data.role,
          status: "ACTIVE",
        });
      }

      return success({ role: appUser.role! });
    } catch (error) {
      return failure((error as Error).message, 500);
    }
  }
}
