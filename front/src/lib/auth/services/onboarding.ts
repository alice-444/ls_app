import { z } from "zod";
import { Result, failure, success, validateInput } from "../../common";
import { handleError, createErrorContext } from "../../common/error-handler";
import type { AppUserRepository } from "../../users/repositories";
import { verifyUserExists } from "./user-helpers";

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

      // Utiliser findByUserId pour être sûr de trouver l'utilisateur (id ou userId)
      let appUser = await this.appUserRepository.findByUserId(userId);

      if (appUser && appUser.status !== "PENDING" && appUser.status !== "ACTIVE") {
        return failure(
          "Le choix du rôle n'est possible que lors de l'inscription.",
          403
        );
      }

      if (appUser) {
        // Mettre à jour l'utilisateur existant
        appUser = await this.appUserRepository.update(appUser.id, {
          role: validation.data.role,
          status: "ACTIVE",
        });
      } else {
        // Si vraiment pas trouvé (étrange si session active), on le crée
        appUser = await this.appUserRepository.create({
          id: userId,
          userId: userId,
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
