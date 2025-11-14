import { Result, failure, success, validateInput } from "../../common";
import type { IWorkshopRepository } from "../repositories/workshop.repository.interface";
import { sanitizeString } from "../../utils/sanitize";
import type { AppUserRepository } from "../../users/repositories";
import {
  verifyUserExists,
  verifyProfUser,
} from "../../auth/services/user-helpers";
import type { IWorkshopService } from "./workshop.service.interface";
import {
  createWorkshopBackendSchema,
  updateWorkshopBackendSchema,
  publishWorkshopSchema,
  deleteWorkshopSchema,
  type CreateWorkshopBackendInput,
  type UpdateWorkshopBackendInput,
  type PublishWorkshopInput,
  type DeleteWorkshopInput,
  isMinimumTomorrow,
  WORKSHOP_VALIDATION,
} from "../../../shared/validation";

export const createWorkshopSchema = createWorkshopBackendSchema;
export const updateWorkshopSchema = updateWorkshopBackendSchema;
export { publishWorkshopSchema, deleteWorkshopSchema };
export type CreateWorkshopInput = CreateWorkshopBackendInput;
export type UpdateWorkshopInput = UpdateWorkshopBackendInput;
export type { PublishWorkshopInput, DeleteWorkshopInput };

export class WorkshopService implements IWorkshopService {
  constructor(
    private readonly workshopRepository: IWorkshopRepository,
    private readonly appUserRepository: AppUserRepository
  ) {}

  private async verifyProfAccess(userId: string) {
    const userCheck = await verifyUserExists(userId);
    if (!userCheck.ok) {
      return userCheck;
    }

    const profCheck = await verifyProfUser(this.appUserRepository, userId);
    if (!profCheck.ok) {
      return profCheck;
    }

    const { appUser } = profCheck.data;
    if (!appUser) {
      return failure("AppUser not found", 404);
    }

    return success({ appUser });
  }

  private sanitizeWorkshopFields(data: {
    title?: string;
    description?: string | null;
    location?: string | null;
    materialsNeeded?: string | null;
  }) {
    return {
      title: data.title ? sanitizeString(data.title) : undefined,
      description: data.description ? sanitizeString(data.description) : null,
      location: data.location ? sanitizeString(data.location) : null,
      materialsNeeded: data.materialsNeeded
        ? sanitizeString(data.materialsNeeded)
        : null,
    };
  }

  async createWorkshop(
    userId: string,
    input: unknown
  ): Promise<Result<{ workshopId: string }>> {
    const validation = validateInput(createWorkshopSchema, input);
    if (!validation.ok) {
      return validation;
    }

    try {
      const accessCheck = await this.verifyProfAccess(userId);
      if (!accessCheck.ok) {
        return accessCheck;
      }

      const { appUser } = accessCheck.data;

      const sanitized = this.sanitizeWorkshopFields({
        title: validation.data.title,
        description: validation.data.description,
        location: validation.data.location,
        materialsNeeded: validation.data.materialsNeeded,
      });

      const workshop = await this.workshopRepository.create({
        title: sanitized.title!,
        description: sanitized.description,
        date: validation.data.date,
        time: validation.data.time,
        duration: validation.data.duration,
        location: sanitized.location,
        isVirtual: validation.data.isVirtual,
        maxParticipants: validation.data.maxParticipants,
        materialsNeeded: sanitized.materialsNeeded,
        creatorId: appUser.id,
      });

      return success({ workshopId: workshop.id });
    } catch (error) {
      return failure((error as Error).message, 500);
    }
  }

  async updateWorkshop(
    userId: string,
    input: unknown
  ): Promise<Result<{ success: boolean }>> {
    const validation = validateInput(updateWorkshopSchema, input);
    if (!validation.ok) {
      return validation;
    }

    try {
      const accessCheck = await this.verifyProfAccess(userId);
      if (!accessCheck.ok) {
        return accessCheck;
      }

      const { appUser } = accessCheck.data;

      const isOwner = await this.workshopRepository.checkCreatorOwnership(
        validation.data.workshopId,
        appUser.id
      );
      if (!isOwner) {
        return failure("Vous n'êtes pas autorisé à modifier cet atelier", 403);
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
      if (validation.data.date !== undefined)
        updateData.date = validation.data.date;
      if (validation.data.time !== undefined)
        updateData.time = validation.data.time;
      if (validation.data.duration !== undefined)
        updateData.duration = validation.data.duration;
      if (sanitized.location !== undefined)
        updateData.location = sanitized.location;
      if (validation.data.isVirtual !== undefined)
        updateData.isVirtual = validation.data.isVirtual;
      if (validation.data.maxParticipants !== undefined) {
        updateData.maxParticipants = validation.data.maxParticipants;
      }
      if (sanitized.materialsNeeded !== undefined) {
        updateData.materialsNeeded = sanitized.materialsNeeded;
      }

      await this.workshopRepository.update(
        validation.data.workshopId,
        updateData
      );

      return success({ success: true });
    } catch (error) {
      return failure((error as Error).message, 500);
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
      const accessCheck = await this.verifyProfAccess(userId);
      if (!accessCheck.ok) {
        return accessCheck;
      }

      const { appUser } = accessCheck.data;

      const isOwner = await this.workshopRepository.checkCreatorOwnership(
        validation.data.workshopId,
        appUser.id
      );
      if (!isOwner) {
        return failure("Vous n'êtes pas autorisé à publier cet atelier", 403);
      }

      // Get workshop to validate required fields for publication
      const workshop = await this.workshopRepository.findById(
        validation.data.workshopId
      );
      if (!workshop) {
        return failure("Atelier introuvable", 404);
      }

      // Validate required fields for publication
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
      return failure((error as Error).message, 500);
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
      const accessCheck = await this.verifyProfAccess(userId);
      if (!accessCheck.ok) {
        return accessCheck;
      }

      const { appUser } = accessCheck.data;

      const isOwner = await this.workshopRepository.checkCreatorOwnership(
        validation.data.workshopId,
        appUser.id
      );
      if (!isOwner) {
        return failure("Vous n'êtes pas autorisé à supprimer cet atelier", 403);
      }

      await this.workshopRepository.delete(validation.data.workshopId);

      return success({ success: true });
    } catch (error) {
      return failure((error as Error).message, 500);
    }
  }

  async getWorkshopsByCreator(userId: string): Promise<Result<any[]>> {
    try {
      const accessCheck = await this.verifyProfAccess(userId);
      if (!accessCheck.ok) {
        return accessCheck;
      }

      const { appUser } = accessCheck.data;

      const workshops = await this.workshopRepository.findByCreatorId(
        appUser.id
      );

      return success(workshops);
    } catch (error) {
      return failure((error as Error).message, 500);
    }
  }

  async getPublishedWorkshops(): Promise<Result<any[]>> {
    try {
      const workshops = await this.workshopRepository.findPublished();
      return success(workshops);
    } catch (error) {
      return failure((error as Error).message, 500);
    }
  }

  async getWorkshopById(workshopId: string): Promise<Result<any>> {
    try {
      const workshop = await this.workshopRepository.findById(workshopId);
      if (!workshop) {
        return failure("Atelier non trouvé", 404);
      }
      return success(workshop);
    } catch (error) {
      return failure((error as Error).message, 500);
    }
  }
}
