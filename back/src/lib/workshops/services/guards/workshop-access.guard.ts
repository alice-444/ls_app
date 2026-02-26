import type { Result } from "../../../common";
import { failure, success } from "../../../common";
import type { AppUserRepository } from "../../../users/repositories";
import type { IWorkshopRepository } from "../../repositories/workshop.repository.interface";
import {
  verifyUserExists,
  verifyProfUser,
} from "../../../auth/services/user-helpers";

export interface IWorkshopAccessGuard {
  verifyProfAccess(
    userId: string
  ): Promise<Result<{ appUser: any }>>;

  verifyWorkshopOwnership(
    userId: string,
    workshopId: string,
    action: string
  ): Promise<Result<{ appUser: any; workshopId: string }>>;

  verifyApprenticeAccess(
    userId: string
  ): Promise<Result<{ appUser: any }>>;
}

export class WorkshopAccessGuard implements IWorkshopAccessGuard {
  constructor(
    private readonly appUserRepository: AppUserRepository,
    private readonly workshopRepository: IWorkshopRepository
  ) {}

  async verifyProfAccess(
    userId: string
  ): Promise<Result<{ appUser: any }>> {
    const userCheck = await verifyUserExists(userId);
    if (!userCheck.ok) {
      return userCheck;
    }

    const profCheck = await verifyProfUser(this.appUserRepository, userId);
    if (!profCheck.ok) {
      return profCheck;
    }

    return profCheck;
  }

  async verifyWorkshopOwnership(
    userId: string,
    workshopId: string,
    action: string
  ): Promise<Result<{ appUser: any; workshopId: string }>> {
    const accessCheck = await this.verifyProfAccess(userId);
    if (!accessCheck.ok) {
      return accessCheck;
    }

    const { appUser } = accessCheck.data;
    if (!appUser) {
      return failure("AppUser not found", 404);
    }

    const isOwner = await this.workshopRepository.checkCreatorOwnership(
      workshopId,
      appUser.id
    );
    if (!isOwner) {
      return failure(`Vous n'êtes pas autorisé à ${action} cet atelier`, 403);
    }

    return success({ appUser, workshopId });
  }

  async verifyApprenticeAccess(
    userId: string
  ): Promise<Result<{ appUser: any }>> {
    const appUser = await this.appUserRepository.findByUserId(userId);

    if (!appUser) {
      return failure(
        "AppUser not found. Please complete role selection first.",
        404
      );
    }

    if (appUser.role !== "APPRENANT") {
      return failure("Only apprentices can perform this action", 403);
    }

    if (appUser.status !== "ACTIVE") {
      return failure("User account is not active", 403);
    }

    return success({ appUser });
  }
}
