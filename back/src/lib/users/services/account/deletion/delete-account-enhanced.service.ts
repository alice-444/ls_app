import type { PrismaClient } from '@/lib/prisma';
import type { IDeleteAccountEnhancedService } from "./delete-account-enhanced.service.interface";
import type { IWorkshopRepository } from "../../../../workshops/repositories/workshop.repository.interface";
import type { AppUserRepository } from "../../../repositories";
import type { IFileStorageService } from "../shared/file-storage.service.interface";
import { Result, failure, success } from "../../../../common";

export class DeleteAccountEnhancedService
  implements IDeleteAccountEnhancedService
{
  constructor(
    private readonly appUserRepository: AppUserRepository,
    private readonly workshopRepository: IWorkshopRepository,
    private readonly prisma: PrismaClient,
    private readonly fileStorageService: IFileStorageService
  ) {}

  async checkCanDeleteAccount(
    userId: string
  ): Promise<Result<{ canDelete: boolean; reason?: string }>> {
    try {
      const appUser = await this.appUserRepository.findByUserId(userId);

      if (!appUser) {
        return failure("App user not found", 404);
      }

      const now = new Date();

      const creatorWorkshops = await this.workshopRepository.findByCreatorId(
        appUser.id
      );

      const apprenticeWorkshops =
        await this.workshopRepository.findByApprenticeId(appUser.id);

      const allWorkshops = [...creatorWorkshops, ...apprenticeWorkshops];

      const futureWorkshops = allWorkshops.filter((workshop) => {
        if (!workshop.date) return false;
        const workshopDate = new Date(workshop.date);
        const isFuture = workshopDate > now;
        const isPending =
          workshopDate >= now &&
          (workshop.status === "DRAFT" || workshop.status === "PUBLISHED");
        return isFuture || isPending;
      });

      if (futureWorkshops.length > 0) {
        return success({
          canDelete: false,
          reason: "Please cancel your bookings first",
        });
      }

      return success({ canDelete: true });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return failure(
        `Failed to check deletion eligibility: ${errorMessage}`,
        500
      );
    }
  }

  async scrubPII(
    userId: string
  ): Promise<Result<{ success: boolean }>> {
    try {
      const appUser = await this.appUserRepository.findByUserId(userId);

      if (!appUser) {
        return failure("App user not found", 404);
      }

      if (appUser.photoUrl) {
        const deleteResult = await this.fileStorageService.deleteFile(
          appUser.photoUrl
        );
        if (!deleteResult.ok) {
          console.error("Failed to delete photo file:", deleteResult.error);

        }
      }

      await this.prisma.$transaction(async (tx: any) => {
        await tx.user.update({
          where: { id: userId },
          data: {
            email: `deleted_${userId}@anon.local`,
            name: "Deleted User",
            updatedAt: new Date(),
          },
        });

        await tx.user.update({
          where: { userId },
          data: {
            photoUrl: null,
            bio: null,
            displayName: null,
            deletedAt: new Date(),
          },
        });

        await tx.account.updateMany({
          where: { userId },
          data: {
            password: null,
            updatedAt: new Date(),
          },
        });
      });

      return success({ success: true });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return failure(`Failed to scrub PII: ${errorMessage}`, 500);
    }
  }
}
