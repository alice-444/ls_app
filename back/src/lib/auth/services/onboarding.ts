import { z } from "zod";
import { generateInternalId } from "../../utils/id-generator";
import { Result, failure, success, validateInput, prisma } from "../../common";
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

      let appUser = await this.appUserRepository.findByAppUserId(userId);

      if (!appUser) {
        appUser = await this.appUserRepository.create({
          id: generateInternalId(),
          userId: userId,
          role: validation.data.role,
          status: "ACTIVE",
        });
      } else {
        if (appUser.role !== null && appUser.role !== "APPRENANT") {
          return failure(
            "Role already assigned. Cannot change role after onboarding.",
            403
          );
        }

        if (appUser.role === "APPRENANT" && validation.data.role === "MENTOR") {
          appUser = await this.appUserRepository.update(userId, {
            role: validation.data.role,
            status: "ACTIVE",
          });
        } else if (appUser.role === null) {
          if (appUser.status !== "PENDING") {
            return failure(
              "User must be in PENDING status to select role",
              400
            );
          }

          appUser = await this.appUserRepository.update(userId, {
            role: validation.data.role,
            status: "ACTIVE",
          });
        } else {
          return failure(
            "Cannot change role. You can only upgrade from APPRENANT to MENTOR.",
            403
          );
        }
      }

      if (!appUser.role) {
        return failure("Failed to assign role", 500);
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
