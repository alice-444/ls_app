import { Result, failure, success } from "../../../common";
import type { IWorkshopRepository } from "../../repositories/workshop.repository.interface";
import type { IWorkshopSchedulingService } from "./workshop-scheduling.service.interface";
import type { IWorkshopAccessGuard } from "../guards/workshop-access.guard";
import type { INotificationService } from "../../../notifications/services/notification.service.interface";
import type { IEmailService } from "../../../email/services/email.service.interface";
import { WorkshopNotificationService } from "../workshop-notification.service";
import { SchedulingConflictChecker } from "./scheduling-conflict-checker";
import type { ISchedulingConflictChecker } from "./scheduling-conflict-checker";
import { sanitizeString } from "../../../utils/sanitize";
import { WORKSHOP_VALIDATION, isMinimumTomorrow } from "../../../../shared/validation";
import { logger } from "../../../common/logger";
import {
  handleError,
  createErrorContext,
} from "../../../common/error-handler";
import { isValidTimeFormat } from "../../utils/workshop-helpers";
import { WorkshopEmailTemplates } from "../email/workshop-email.templates";
import type { ICreditService } from "../../../credits/services/credit.service.interface";
import type { PrismaClient } from '@/lib/prisma';

export class WorkshopSchedulingService implements IWorkshopSchedulingService {
  private readonly workshopNotificationService: WorkshopNotificationService;
  private readonly conflictChecker: ISchedulingConflictChecker;
  private readonly WORKSHOP_REQUEST_COST = 10;

  constructor(
    private readonly workshopRepository: IWorkshopRepository,
    private readonly accessGuard: IWorkshopAccessGuard,
    private readonly dbNotificationService?: INotificationService,
    private readonly emailService?: IEmailService,
    appUserRepository?: any,
    private readonly creditService?: ICreditService,
    private readonly prisma?: PrismaClient
  ) {
    this.workshopNotificationService = new WorkshopNotificationService(
      this.workshopRepository,
      this.dbNotificationService,
      appUserRepository
    );
    this.conflictChecker = new SchedulingConflictChecker(this.workshopRepository);
  }

  private sanitizeLocation(location: string | null | undefined): string | null {
    if (!location) return null;
    return sanitizeString(location, {
      maxLength: WORKSHOP_VALIDATION.location.max,
      trim: true,
    });
  }

  async updateWorkshopScheduling(
    userId: string,
    workshopId: string,
    input: {
      date?: Date | null;
      time?: string | null;
      duration?: number | null;
      location?: string | null;
    }
  ): Promise<Result<{ success: boolean }>> {
    try {
      const workshop = await this.workshopRepository.findById(workshopId);
      if (!workshop) {
        return failure("Atelier non trouvé", 404);
      }

      const accessCheck = await this.accessGuard.verifyProfAccess(userId);
      const isMentor =
        accessCheck.ok &&
        accessCheck.data.appUser !== null &&
        accessCheck.data.appUser.id === workshop.creatorId;

      let isApprentice = false;
      if (workshop.apprenticeId) {
        const apprenticeCheck = await this.accessGuard.verifyApprenticeAccess(userId);
        isApprentice =
          apprenticeCheck.ok &&
          apprenticeCheck.data.appUser.id === workshop.apprenticeId;
      }

      if (!isMentor && !isApprentice) {
        return failure("Vous n'êtes pas autorisé à modifier cet atelier", 403);
      }

      const updateData: any = {};
      if (input.date !== undefined) updateData.date = input.date;
      if (input.time !== undefined) updateData.time = input.time;
      if (input.duration !== undefined) updateData.duration = input.duration;
      if (input.location !== undefined) {
        updateData.location = this.sanitizeLocation(input.location);
      }

      await this.workshopRepository.update(workshopId, updateData);

      if (isMentor && this.dbNotificationService) {
        await this.notifySchedulingChange(workshopId, userId, input);
      }

      logger.info("Workshop scheduling updated", {
        workshopId,
        mentorId: userId,
        changes: Object.keys(updateData),
      });

      return success({ success: true });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("updateWorkshopScheduling", {
          userId,
          resourceId: workshopId,
        })
      );
    }
  }

  private async notifySchedulingChange(
    workshopId: string,
    userId: string,
    input: { date?: Date | null; time?: string | null; duration?: number | null; location?: string | null }
  ): Promise<void> {
    const updatedWorkshop = await this.workshopRepository.findById(workshopId);
    if (!updatedWorkshop?.apprentice?.user?.id) return;

    const changes: string[] = [];
    if (input.date !== undefined) changes.push("la date");
    if (input.time !== undefined) changes.push("l'heure");
    if (input.duration !== undefined) changes.push("la durée");
    if (input.location !== undefined) changes.push("le lieu");

    if (changes.length > 0) {
      const mentorName = updatedWorkshop.creator?.name || "le mentor";
      await this.dbNotificationService!.createNotification(
        updatedWorkshop.apprentice.id,
        {
          type: "workshop",
          title: "Modification de l'atelier",
          message: `${mentorName} a modifié ${changes.join(", ")} de l'atelier "${updatedWorkshop.title}".`,
          actionUrl: `/workshop/${workshopId}`,
        },
        userId
      );
    }
  }

  async cancelConfirmedWorkshop(
    userId: string,
    workshopId: string,
    cancellationReason?: string
  ): Promise<Result<{ success: boolean }>> {
    try {
      const workshop = await this.workshopRepository.findById(workshopId);
      if (!workshop) {
        return failure("Atelier non trouvé", 404);
      }

      let isApprentice = false;
      if (workshop.apprenticeId) {
        const apprenticeCheck = await this.accessGuard.verifyApprenticeAccess(userId);
        isApprentice =
          apprenticeCheck.ok &&
          apprenticeCheck.data.appUser.id === workshop.apprenticeId;
      }

      let isMentor = false;
      if (!isApprentice) {
        const accessCheck = await this.accessGuard.verifyProfAccess(userId);
        isMentor =
          accessCheck.ok &&
          accessCheck.data.appUser !== null &&
          accessCheck.data.appUser.id === workshop.creatorId;
      }

      if (!isMentor && !isApprentice) {
        return failure("Vous n'êtes pas autorisé à annuler cet atelier", 403);
      }

      if (workshop.status === "CANCELLED") {
        return failure("Cet atelier est déjà annulé", 400);
      }

      if (isApprentice) {
        return this.handleApprenticeCancellation(
          userId,
          workshopId,
          workshop,
          cancellationReason
        );
      }

      return this.handleMentorCancellation(userId, workshopId, workshop);
    } catch (error) {
      return handleError(
        error,
        createErrorContext("cancelConfirmedWorkshop", {
          userId,
          resourceId: workshopId,
          details: { cancellationReason },
        })
      );
    }
  }

  private async handleApprenticeCancellation(
    userId: string,
    workshopId: string,
    workshop: any,
    cancellationReason?: string
  ): Promise<Result<{ success: boolean }>> {
    if (this.prisma && this.creditService && workshop.apprenticeId) {
      await this.prisma.$transaction(async (tx) => {
        await this.workshopRepository.removeApprentice(workshopId, tx);

        const apprentice = await (tx as any).user.findUnique({
          where: { id: workshop.apprenticeId },
          select: { userId: true },
        });

        if (apprentice) {
          await this.creditService!.refundCreditsInTransaction(
            apprentice.userId,
            this.WORKSHOP_REQUEST_COST,
            `Remboursement participation annulée: ${workshop.title}`,
            tx
          );
        }
      });
    } else {
      await this.workshopRepository.removeApprentice(workshopId);
    }

    if (this.dbNotificationService) {
      const cancelledWorkshop = await this.workshopRepository.findById(workshopId);
      if (cancelledWorkshop?.creator?.id) {
        const apprenticeName = cancelledWorkshop.apprentice?.name || "un apprenti";
        const message = cancellationReason
          ? `${apprenticeName} a annulé sa participation à l'atelier "${cancelledWorkshop.title}". Raison: ${cancellationReason}`
          : `${apprenticeName} a annulé sa participation à l'atelier "${cancelledWorkshop.title}".`;

        await this.dbNotificationService.createNotification(
          cancelledWorkshop.creator.id,
          {
            type: "workshop",
            title: "Participation annulée",
            message,
            actionUrl: `/workshop/${workshopId}`,
          },
          userId
        );
      }
    }

    logger.info("Workshop participation cancelled by apprentice", {
      workshopId,
      apprenticeId: userId,
      hasReason: !!cancellationReason,
    });

    if (this.emailService) {
      await this.sendCancellationEmail(workshopId, userId, cancellationReason);
    }

    return success({ success: true });
  }

  private async handleMentorCancellation(
    userId: string,
    workshopId: string,
    workshop: any
  ): Promise<Result<{ success: boolean }>> {
    if (this.prisma && this.creditService && workshop.apprenticeId) {
      await this.prisma.$transaction(async (tx) => {
        await this.workshopRepository.update(workshopId, { status: "CANCELLED" }, tx);

        const apprentice = await (tx as any).user.findUnique({
          where: { id: workshop.apprenticeId },
          select: { userId: true },
        });

        if (apprentice) {
          await this.creditService!.refundCreditsInTransaction(
            apprentice.userId,
            this.WORKSHOP_REQUEST_COST,
            `Remboursement atelier annulé par mentor: ${workshop.title}`,
            tx
          );
        }
      });
    } else {
      await this.workshopRepository.update(workshopId, { status: "CANCELLED" });
    }

    if (this.dbNotificationService) {
      const cancelledWorkshop = await this.workshopRepository.findById(workshopId);
      if (cancelledWorkshop?.apprentice?.id) {
        const mentorName = cancelledWorkshop.creator?.name || "le mentor";
        await this.dbNotificationService.createNotification(
          cancelledWorkshop.apprentice.id,
          {
            type: "workshop",
            title: "Atelier annulé",
            message: `${mentorName} a annulé l'atelier "${cancelledWorkshop.title}".`,
            actionUrl: `/workshop-room`,
          },
          userId
        );
      }
    }

    logger.info("Workshop cancelled by mentor", { workshopId, mentorId: userId });

    return success({ success: true });
  }

  private async sendCancellationEmail(
    workshopId: string,
    userId: string,
    cancellationReason?: string
  ): Promise<void> {
    try {
      const cancelledWorkshop = await this.workshopRepository.findById(workshopId);
      const creator = cancelledWorkshop?.creator;
      if (!cancelledWorkshop || !creator?.email || !this.emailService) return;

      const template = WorkshopEmailTemplates.cancellation({
        recipientName: creator.name || "Mentor",
        apprenticeName: cancelledWorkshop.apprentice?.name || "un apprenti",
        workshopTitle: cancelledWorkshop.title,
        workshopDate: cancelledWorkshop.date,
        workshopTime: cancelledWorkshop.time,
        workshopId,
        cancellationReason,
      });

      const emailResult = await this.emailService.sendEmail({
        to: creator.email,
        ...template,
      });

      if (!emailResult.ok) {
        logger.error("Failed to send cancellation email", {
          workshopId,
          error: emailResult.error,
        });
      }
    } catch (error) {
      logger.error("Error sending cancellation email", { workshopId, error });
    }
  }

  async rescheduleWorkshop(
    userId: string,
    workshopId: string,
    input: {
      date: Date;
      time: string;
      duration?: number | null;
      location?: string | null;
    }
  ): Promise<
    Result<{ success: boolean; oldDate: Date | null; oldTime: string | null }>
  > {
    try {
      const workshop = await this.workshopRepository.findById(workshopId);
      if (!workshop) {
        return failure("Atelier non trouvé", 404);
      }

      const accessCheck = await this.accessGuard.verifyProfAccess(userId);
      if (!accessCheck.ok) {
        return accessCheck;
      }

      const { appUser } = accessCheck.data;
      if (!appUser) {
        return failure("AppUser not found", 404);
      }

      if (appUser.id !== workshop.creatorId) {
        return failure(
          "Vous n'êtes pas autorisé à reprogrammer cet atelier",
          403
        );
      }

      if (workshop.status !== "PUBLISHED") {
        return failure(
          "Seuls les ateliers publiés peuvent être reprogrammés",
          400
        );
      }

      const validationError = this.validateRescheduleInput(input);
      if (validationError) {
        return validationError;
      }

      const duration = input.duration ?? workshop.duration ?? 60;
      const conflictCheck = await this.conflictChecker.checkResourceConflicts(
        workshop.creatorId,
        workshopId,
        input.date,
        input.time,
        duration,
        input.location ?? workshop.location,
        workshop.isVirtual
      );

      if (!conflictCheck.ok) {
        return conflictCheck;
      }

      if (conflictCheck.data.hasConflict) {
        return failure(
          conflictCheck.data.conflictMessage || "Conflit de ressources détecté",
          409
        );
      }

      const oldDate = workshop.date;
      const oldTime = workshop.time;

      const updateData: any = {
        date: input.date,
        time: input.time,
      };

      if (input.duration !== undefined) {
        updateData.duration = input.duration;
      }

      if (input.location !== undefined) {
        updateData.location = this.sanitizeLocation(input.location);
      }

      await this.workshopRepository.update(workshopId, updateData);

      const notificationResult =
        await this.workshopNotificationService.notifyWorkshopRescheduled(
          workshopId,
          oldDate,
          oldTime,
          input.date,
          input.time,
          userId
        );

      if (!notificationResult.ok) {
        logger.error(
          "Erreur lors de l'envoi des notifications",
          notificationResult.error,
          { workshopId, userId }
        );
      }

      return success({ success: true, oldDate, oldTime });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("rescheduleWorkshop", {
          userId,
          resourceId: workshopId,
          details: { newDate: input.date, newTime: input.time },
        })
      );
    }
  }

  private validateRescheduleInput(
    input: { date: Date; time: string }
  ): Result<any> | null {
    if (!isMinimumTomorrow(input.date)) {
      return failure("La nouvelle date doit être au minimum demain", 400);
    }

    if (!isValidTimeFormat(input.time)) {
      return failure("Format d'heure invalide (HH:MM requis)", 400);
    }

    return null;
  }
}
