import type { PrismaClient } from "@/lib/prisma";
import type {
  IDeleteAccountEnhancedService,
  DeletionEligibility,
} from "./delete-account-enhanced.service.interface";
import type { IWorkshopRepository } from "../../../../workshops/repositories/workshop.repository.interface";
import type { AppUserRepository } from "../../../repositories";
import type { IFileStorageService } from "../shared/file-storage.service.interface";
import { Result, failure, success } from "../../../../common";
import type { IEmailService } from "../../../../email/services/email.service.interface";
import { renderEmailTemplate } from "../../../../email/utils/render-email";
import { AccountDeletionConfirmedEmail } from "../../../../email/templates/AccountDeletionConfirmedEmail";
import * as React from "react";
import { logger } from "../../../../common/logger";

export class DeleteAccountEnhancedService implements IDeleteAccountEnhancedService {
  constructor(
    private readonly appUserRepository: AppUserRepository,
    private readonly workshopRepository: IWorkshopRepository,
    private readonly prisma: PrismaClient,
    private readonly fileStorageService: IFileStorageService,
    private readonly emailService?: IEmailService,
  ) {}

  async checkCanDeleteAccount(
    userId: string,
  ): Promise<Result<DeletionEligibility>> {
    try {
      const appUser = await this.appUserRepository.findByUserId(userId);

      if (!appUser) {
        return failure("App user not found", 404);
      }

      const now = new Date();

      const creatorWorkshops = await this.workshopRepository.findByCreatorId(
        appUser.id,
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
        500,
      );
    }
  }

  async initiateDeletion(
    userId: string,
    reason?: string,
  ): Promise<Result<{ success: boolean }>> {
    try {
      const canDeleteResult = await this.checkCanDeleteAccount(userId);
      if (!canDeleteResult.ok) {
        return failure(canDeleteResult.error, 400);
      }
      if (!canDeleteResult.data.canDelete) {
        return failure(
          canDeleteResult.data.reason || "Cannot delete account",
          400,
        );
      }

      const appUser = await this.appUserRepository.findByUserId(userId);
      if (!appUser) {
        return failure("App user not found", 404);
      }

      // Send confirmation email BEFORE anonymizing
      if (this.emailService && appUser.email) {
        try {
          const { html, text } = await renderEmailTemplate(
            React.createElement(AccountDeletionConfirmedEmail, {
              userName: appUser.displayName || appUser.name || "Utilisateur",
            }),
          );

          await this.emailService.sendEmail({
            to: appUser.email,
            subject: "Confirmation de la suppression de votre compte LearnSup",
            html,
            text,
          });
        } catch (err) {
          logger.error("Failed to send deletion confirmation email", {
            userId,
            error: err,
          });
        }
      }

      await this.prisma.$transaction(async (tx: any) => {
        // 1. Mark user as deleted (soft delete)
        await tx.user.update({
          where: { userId },
          data: {
            deletedAt: new Date(),
            deletionReason: reason || null,
            status: "DELETED",
          },
        });

        // 2. Create a deletion job for 30 days from now
        const runAt = new Date();
        runAt.setDate(runAt.getDate() + 30);

        await tx.deletion_job.create({
          data: {
            userId,
            runAt,
            status: "PENDING",
          },
        });
      });

      return success({ success: true });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return failure(`Failed to initiate deletion: ${errorMessage}`, 500);
    }
  }

  async scrubPII(userId: string): Promise<Result<{ success: boolean }>> {
    try {
      const appUser = await this.appUserRepository.findByUserId(userId);

      if (!appUser) {
        return failure("App user not found", 404);
      }

      if (appUser.photoUrl) {
        const deleteResult = await this.fileStorageService.deleteFile(
          appUser.photoUrl,
        );
        if (!deleteResult.ok) {
          console.error("Failed to delete photo file:", deleteResult.error);
        }
      }

      await this.prisma.$transaction(async (tx: any) => {
        await tx.user.update({
          where: { userId },
          data: {
            email: `deleted_${userId}@anon.local`,
            name: "Deleted User",
            displayName: "Utilisateur Supprimé",
            photoUrl: null,
            bio: null,
            experience: null,
            qualifications: null,
            updatedAt: new Date(),
            deletedAt: new Date(),
            status: "DELETED",
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
