import { Result, failure, success, validateInput } from "../../../common";
import type { IWorkshopRepository } from "../../repositories/workshop.repository.interface";
import type { INotificationService } from "../../../notifications/services/notification.service.interface";
import { sanitizeString } from "../../../utils/sanitize";
import type { IWorkshopLifecycleService } from "./workshop-lifecycle.service.interface";
import type { IWorkshopAccessGuard } from "../guards/workshop-access.guard";
import {
  createWorkshopBackendSchema,
  updateWorkshopBackendSchema,
  publishWorkshopSchema,
  unpublishWorkshopSchema,
  deleteWorkshopSchema,
  cancelWorkshopSchema,
  isMinimumTomorrow,
  WORKSHOP_VALIDATION,
} from "@ls-app/shared";
import { handleError, createErrorContext } from "../../../common/error-handler";
import { WorkshopDomain } from "../../domain/workshop.domain";

export class WorkshopLifecycleService implements IWorkshopLifecycleService {
  constructor(
    private readonly workshopRepository: IWorkshopRepository,
    private readonly accessGuard: IWorkshopAccessGuard,
    private readonly notificationService?: INotificationService,
  ) {}

  private sanitizeWorkshopFields(data: {
    title?: string;
    description?: string | null;
    location?: string | null;
    materialsNeeded?: string | null;
  }) {
    return {
      title: data.title
        ? sanitizeString(data.title, {
            maxLength: WORKSHOP_VALIDATION.title.max,
            trim: true,
          })
        : undefined,
      description: data.description
        ? sanitizeString(data.description, {
            maxLength: WORKSHOP_VALIDATION.description.max,
            trim: true,
          })
        : null,
      location: data.location
        ? sanitizeString(data.location, {
            maxLength: WORKSHOP_VALIDATION.location.max,
            trim: true,
          })
        : null,
      materialsNeeded: data.materialsNeeded
        ? sanitizeString(data.materialsNeeded, {
            maxLength: WORKSHOP_VALIDATION.materialsNeeded.max,
            trim: true,
          })
        : null,
    };
  }

  async createWorkshop(
    userId: string,
    input: unknown,
  ): Promise<Result<{ workshopId: string }>> {
    const validation = validateInput(createWorkshopBackendSchema, input);
    if (!validation.ok) {
      return validation;
    }

    try {
      const accessCheck = await this.accessGuard.verifyMentorAccess(userId);
      if (!accessCheck.ok) {
        return accessCheck;
      }

      const { appUser } = accessCheck.data;
      if (!appUser) {
        return failure("AppUser not found", 404);
      }

      const sanitized = this.sanitizeWorkshopFields({
        title: validation.data.title,
        description: validation.data.description,
        location: validation.data.location,
        materialsNeeded: validation.data.materialsNeeded,
      });

      const workshop = await this.workshopRepository.create({
        title: sanitized.title!,
        description: sanitized.description,
        topic: validation.data.topic ?? null,
        date: validation.data.date,
        time: validation.data.time,
        duration: validation.data.duration,
        location: sanitized.location,
        isVirtual: validation.data.isVirtual,
        maxParticipants: validation.data.maxParticipants,
        materialsNeeded: sanitized.materialsNeeded,
        creditCost: validation.data.creditCost ?? null,
        creatorId: appUser.id,
      });

      return success({ workshopId: workshop.id });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("createWorkshop", { userId }),
      );
    }
  }

  private buildUpdateWorkshopData(
    validationData: { workshopId: string } & Record<string, unknown>,
    sanitized: ReturnType<WorkshopLifecycleService["sanitizeWorkshopFields"]>,
  ): Result<Record<string, unknown>> {
    const updateData: Record<string, unknown> = {};
    const assignIfDefined = (key: string, value: unknown) => {
      if (value !== undefined) updateData[key] = value;
    };

    assignIfDefined("title", sanitized.title);
    assignIfDefined("description", sanitized.description);
    assignIfDefined("location", sanitized.location);
    assignIfDefined("materialsNeeded", sanitized.materialsNeeded);
    assignIfDefined("time", validationData.time);
    assignIfDefined("duration", validationData.duration);
    assignIfDefined("isVirtual", validationData.isVirtual);
    // Prisma: creditCost & maxParticipants are non-nullable Int — never pass null (causes 500).
    if (
      validationData.maxParticipants !== undefined &&
      validationData.maxParticipants !== null
    ) {
      updateData.maxParticipants = validationData.maxParticipants;
    }
    assignIfDefined("topic", validationData.topic);
    if (
      validationData.creditCost !== undefined &&
      validationData.creditCost !== null
    ) {
      updateData.creditCost = validationData.creditCost;
    }

    if (validationData.date !== undefined) {
      if (!isMinimumTomorrow(validationData.date as string)) {
        return failure("La date doit être au minimum demain", 400);
      }
      updateData.date = validationData.date;
    }

    return success(updateData);
  }

  async updateWorkshop(
    userId: string,
    input: unknown,
  ): Promise<Result<{ success: boolean }>> {
    const validation = validateInput(updateWorkshopBackendSchema, input);
    if (!validation.ok) {
      return validation;
    }

    try {
      const ownershipCheck = await this.accessGuard.verifyWorkshopOwnership(
        userId,
        validation.data.workshopId,
        "modifier",
      );
      if (!ownershipCheck.ok) {
        return ownershipCheck;
      }

      const sanitized = this.sanitizeWorkshopFields({
        title: validation.data.title,
        description: validation.data.description,
        location: validation.data.location,
        materialsNeeded: validation.data.materialsNeeded,
      });

      const updateResult = this.buildUpdateWorkshopData(
        validation.data as { workshopId: string } & Record<string, unknown>,
        sanitized,
      );
      if (!updateResult.ok) {
        return updateResult;
      }

      await this.workshopRepository.update(
        validation.data.workshopId,
        updateResult.data as any,
      );

      return success({ success: true });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("updateWorkshop", {
          userId,
          resourceId: validation.data.workshopId,
        }),
      );
    }
  }

  async publishWorkshop(
    userId: string,
    input: unknown,
  ): Promise<Result<{ success: boolean; publishedAt: Date }>> {
    const validation = validateInput(publishWorkshopSchema, input);
    if (!validation.ok) {
      return validation;
    }

    try {
      const ownershipCheck = await this.accessGuard.verifyWorkshopOwnership(
        userId,
        validation.data.workshopId,
        "publier",
      );
      if (!ownershipCheck.ok) {
        return ownershipCheck;
      }

      const { appUser } = ownershipCheck.data;
      if (!appUser.isPublished) {
        return failure(
          "Tu dois publier ton profil de mentor avant de pouvoir publier un atelier.",
          403,
        );
      }

      const workshop = await this.workshopRepository.findById(
        validation.data.workshopId,
      );
      if (!workshop) {
        return failure("Atelier introuvable", 404);
      }

      const { can, reasons } = WorkshopDomain.canBePublished(workshop);

      if (!can) {
        return failure(
          `Impossible de publier l'atelier. Raisons : ${reasons.join(", ")}`,
          400,
        );
      }

      const publishedAt = new Date();

      await this.workshopRepository.update(validation.data.workshopId, {
        status: "PUBLISHED",
        publishedAt,
      });

      return success({ success: true, publishedAt });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("publishWorkshop", {
          userId,
          resourceId: validation.data.workshopId,
        }),
      );
    }
  }

  async unpublishWorkshop(
    userId: string,
    input: unknown,
  ): Promise<Result<{ success: boolean }>> {
    const validation = validateInput(unpublishWorkshopSchema, input);
    if (!validation.ok) {
      return validation;
    }

    try {
      const ownershipCheck = await this.accessGuard.verifyWorkshopOwnership(
        userId,
        validation.data.workshopId,
        "dépublier",
      );
      if (!ownershipCheck.ok) {
        return ownershipCheck;
      }

      const workshop = await this.workshopRepository.findById(
        validation.data.workshopId,
      );
      if (!workshop) {
        return failure("Atelier introuvable", 404);
      }

      if (workshop.status !== "PUBLISHED") {
        return failure("Cet atelier n'est pas publié", 400);
      }

      await this.workshopRepository.update(validation.data.workshopId, {
        status: "DRAFT",
        publishedAt: null,
      });

      return success({ success: true });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("unpublishWorkshop", {
          userId,
          resourceId: validation.data.workshopId,
        }),
      );
    }
  }

  async deleteWorkshop(
    userId: string,
    input: unknown,
  ): Promise<Result<{ success: boolean }>> {
    const validation = validateInput(deleteWorkshopSchema, input);
    if (!validation.ok) {
      return validation;
    }

    try {
      const ownershipCheck = await this.accessGuard.verifyWorkshopOwnership(
        userId,
        validation.data.workshopId,
        "supprimer",
      );
      if (!ownershipCheck.ok) {
        return ownershipCheck;
      }

      await this.workshopRepository.delete(validation.data.workshopId);

      return success({ success: true });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("deleteWorkshop", {
          userId,
          resourceId: validation.data.workshopId,
        }),
      );
    }
  }

  async cancelWorkshop(
    userId: string,
    input: unknown,
  ): Promise<Result<{ success: boolean }>> {
    const validation = validateInput(cancelWorkshopSchema, input);
    if (!validation.ok) {
      return validation;
    }

    try {
      const ownershipCheck = await this.accessGuard.verifyWorkshopOwnership(
        userId,
        validation.data.workshopId,
        "annuler",
      );
      if (!ownershipCheck.ok) {
        return ownershipCheck;
      }

      const workshop = await this.workshopRepository.findById(
        validation.data.workshopId,
      );
      if (!workshop) {
        return failure("Atelier introuvable", 404);
      }

      await this.workshopRepository.update(validation.data.workshopId, {
        status: "CANCELLED",
      });

      // Trigger notification for the participant if any
      if (this.notificationService && workshop.apprenticeId) {
        const creatorName = workshop.creator?.name || "Le mentor";
        await this.notificationService.createNotification(
          workshop.apprenticeId,
          {
            type: "workshop",
            title: "Atelier annulé",
            message: `${creatorName} a annulé l'atelier "${workshop.title}".`,
            actionUrl: `/catalog`,
          },
          userId,
        );
      }

      return success({ success: true });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("cancelWorkshop", {
          userId,
          resourceId: validation.data.workshopId,
        }),
      );
    }
  }
}
