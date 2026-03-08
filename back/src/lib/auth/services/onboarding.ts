import { z } from "zod";
import { Result, failure, success, validateInput } from "../../common";
import { handleError, createErrorContext } from "../../common/error-handler";
import type { AppUserRepository } from "../../users/repositories";
import { verifyUserExists } from "./user-helpers";
import { generateInternalId } from "../../utils/id-generator";

export const selectRoleSchema = z.object({
  role: z.enum(["MENTOR", "APPRENANT"]),
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
      const userCheck = await verifyUserExists(userId);
      if (!userCheck.ok) {
        return userCheck;
      }

      let appUser = await this.appUserRepository.findByAppUserId(userId);

      if (!appUser) {
        appUser = await this.appUserRepository.create({
          id: generateInternalId(),
          userId: userId,
          role: validation.data.role,
          status: "ACTIVE",
        });
      } else {
        // Autoriser le changement de rôle tant que le compte n'est pas bloqué ou supprimé
        if (appUser.status !== "PENDING" && appUser.status !== "ACTIVE") {
           return failure(
            "Votre compte n'est plus en état de modification de rôle.",
            403
          );
        }

        appUser = await this.appUserRepository.update(userId, {
          role: validation.data.role,
          status: "ACTIVE",
        });
      }

      if (!appUser.role) {
        return failure("Échec de l'assignation du rôle", 500);
      }

      return success({ role: appUser.role });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("selectRole", {
          userId,
          details: { role: validation.data.role },
        })
      );
    }
  }
}
