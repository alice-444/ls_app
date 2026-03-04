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
} from "../../../../shared/validation";
import {
  handleError,
  createErrorContext,
} from "../../../common/error-handler";

export class WorkshopLifecycleService implements IWorkshopLifecycleService {
  constructor(
    private readonly workshopRepository: IWorkshopRepository,
    private readonly accessGuard: IWorkshopAccessGuard,
    private readonly notificationService?: INotificationService
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
    input: unknown
  ): Promise<Result<{ workshopId: string }>> {
    const validation = validateInput(createWorkshopBackendSchema, input);
    if (!validation.ok) {
      return validation;
    }

    try {
      const accessCheck = await this.accessGuard.verifyProfAccess(userId);
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
        createErrorContext("createWorkshop", { userId })
      );
    }
  }

  async updateWorkshop(
    userId: string,
    input: unknown
  ): Promise<Result<{ success: boolean }>> {
    const validation = validateInput(updateWorkshopBackendSchema, input);
    if (!validation.ok) {
      return validation;
    }

    try {
      const ownershipCheck = await this.accessGuard.verifyWorkshopOwnership(
        userId,
        validation.data.workshopId,
        "modifier"
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

      const updateData: any = {};

      if (sanitized.title !== undefined) updateData.title = sanitized.title;
      if (sanitized.description !== undefined)
        updateData.description = sanitized.description;
      if (validation.data.date !== undefined) {
        if (!isMinimumTomorrow(validation.data.date)) {
          return failure("La date doit être au minimum demain", 400);
        }
        updateData.date = validation.data.date;
      }
      if (validation.data.time !== undefined)
        updateData.time = validation.data.time;
      if (validation.data.duration !== undefined)
        updateData.duration = validation.data.duration;
      if (sanitized.location !== undefined)
        updateData.location = sanitized.location;
      if (validation.data.isVirtual !== undefined)
        updateData.isVirtual = validation.data.isVirtual;
      if (validation.data.maxParticipants !== undefined)
        updateData.maxParticipants = validation.data.maxParticipants;
      if (sanitized.materialsNeeded !== undefined)
        updateData.materialsNeeded = sanitized.materialsNeeded;
      if (validation.data.topic !== undefined)
        updateData.topic = validation.data.topic;
      if (validation.data.creditCost !== undefined)
        updateData.creditCost = validation.data.creditCost;

      await this.workshopRepository.update(
        validation.data.workshopId,
        updateData
      );

      return success({ success: true });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("updateWorkshop", {
          userId,
          resourceId: validation.data.workshopId,
        })
      );
    }
  }

  async publishWorkshop(
    userId: string,
    input: unknown
  ): Promise<Result<{ success: boolean; publishedAt: Date }>> {
    const validation = validateInput(publishWorkshopSchema, input);
    if (!validation.ok) {
      return validation;
    }

    try {
      const ownershipCheck = await this.accessGuard.verifyWorkshopOwnership(
        userId,
        validation.data.workshopId,
        "publier"
      );
      if (!ownershipCheck.ok) {
        return ownershipCheck;
      }

      const workshop = await this.workshopRepository.findById(
        validation.data.workshopId
      );
      if (!workshop) {
        return failure("Atelier introuvable", 404);
      }

      const missingFields: string[] = [];

      if (
        !workshop.title ||
        workshop.title.trim().length < WORKSHOP_VALIDATION.title.min
      ) {
        missingFields.push(
          `titre (minimum ${WORKSHOP_VALIDATION.title.min} caractères)`
        );
      }
      if (!workshop.description || workshop.description.trim().length < 30) {
        missingFields.push("description (minimum 30 caractères recommandé)");
      }
      if (!workshop.date) {
        missingFields.push("date");
      } else if (!isMinimumTomorrow(workshop.date)) {
        return failure(
          "La date doit être au minimum demain pour publier l'atelier",
          400
        );
      }
      if (!workshop.time) {
        missingFields.push("heure");
      }
      if (
        !workshop.duration ||
        workshop.duration < WORKSHOP_VALIDATION.duration.min
      ) {
        missingFields.push(
          `durée (minimum ${WORKSHOP_VALIDATION.duration.min} minutes)`
        );
      }

      if (missingFields.length > 0) {
        return failure(
          `Impossible de publier l'atelier. Champs manquants ou invalides : ${missingFields.join(
            ", "
          )}`,
          400
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
        })
      );
    }
  }

  async unpublishWorkshop(
    userId: string,
    input: unknown
  ): Promise<Result<{ success: boolean }>> {
    const validation = validateInput(unpublishWorkshopSchema, input);
    if (!validation.ok) {
      return validation;
    }

    try {
      const ownershipCheck = await this.accessGuard.verifyWorkshopOwnership(
        userId,
        validation.data.workshopId,
        "dépublier"
      );
      if (!ownershipCheck.ok) {
        return ownershipCheck;
      }

      const workshop = await this.workshopRepository.findById(
        validation.data.workshopId
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
        })
      );
    }
  }

  async deleteWorkshop(
    userId: string,
    input: unknown
  ): Promise<Result<{ success: boolean }>> {
    const validation = validateInput(deleteWorkshopSchema, input);
    if (!validation.ok) {
      return validation;
    }

    try {
      const ownershipCheck = await this.accessGuard.verifyWorkshopOwnership(
        userId,
        validation.data.workshopId,
        "supprimer"
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
        })
      );
    }
  }

  async cancelWorkshop(
    userId: string,
    input: unknown
  ): Promise<Result<{ success: boolean }>> {
    const validation = validateInput(cancelWorkshopSchema, input);
    if (!validation.ok) {
      return validation;
    }

    try {
      const ownershipCheck = await this.accessGuard.verifyWorkshopOwnership(
        userId,
        validation.data.workshopId,
        "annuler"
      );
      if (!ownershipCheck.ok) {
        return ownershipCheck;
      }

      const workshop = await this.workshopRepository.findById(
        validation.data.workshopId
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
            actionUrl: `/workshop-room`,
          },
          userId
        );
      }

      return success({ success: true });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("cancelWorkshop", {
          userId,
          resourceId: validation.data.workshopId,
        })
      );
    }
  }
}
