import { Result, failure, success, validateInput } from "../../common";
import type { IWorkshopRepository } from "../repositories/workshop.repository.interface";
import { sanitizeString } from "../../utils/sanitize";
import type { AppUserRepository } from "../../users/repositories";
import type { IWorkshopRequestRepository } from "../../mentors/repositories/workshop-request.repository.interface";
import { z } from "zod";
import {
  verifyUserExists,
  verifyProfUser,
} from "../../auth/services/user-helpers";
import type { IWorkshopService } from "./workshop.service.interface";
import {
  createWorkshopBackendSchema,
  updateWorkshopBackendSchema,
  publishWorkshopSchema,
  unpublishWorkshopSchema,
  deleteWorkshopSchema,
  type CreateWorkshopBackendInput,
  type UpdateWorkshopBackendInput,
  type PublishWorkshopInput,
  type DeleteWorkshopInput,
  isMinimumTomorrow,
  WORKSHOP_VALIDATION,
} from "../../../shared/validation";
import { WorkshopNotificationService } from "./workshop-notification.service";

export const createWorkshopSchema = createWorkshopBackendSchema;
export const updateWorkshopSchema = updateWorkshopBackendSchema;
export { publishWorkshopSchema, unpublishWorkshopSchema, deleteWorkshopSchema };
export type CreateWorkshopInput = CreateWorkshopBackendInput;
export type UpdateWorkshopInput = UpdateWorkshopBackendInput;
export type { PublishWorkshopInput, DeleteWorkshopInput };
export type UnpublishWorkshopInput = z.infer<typeof unpublishWorkshopSchema>;

export class WorkshopService implements IWorkshopService {
  private readonly notificationService: WorkshopNotificationService;

  constructor(
    private readonly workshopRepository: IWorkshopRepository,
    private readonly appUserRepository: AppUserRepository,
    private readonly workshopRequestRepository?: IWorkshopRequestRepository
  ) {
    this.notificationService = new WorkshopNotificationService(
      this.workshopRepository
    );
  }

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
        topic: validation.data.topic ?? null,
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
      if (validation.data.topic !== undefined) {
        updateData.topic = validation.data.topic;
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

  async unpublishWorkshop(
    userId: string,
    input: unknown
  ): Promise<Result<{ success: boolean }>> {
    const validation = validateInput(unpublishWorkshopSchema, input);
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
        return failure("Vous n'êtes pas autorisé à dépublier cet atelier", 403);
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

  async getConfirmedWorkshopsForApprentice(
    userId: string
  ): Promise<Result<any[]>> {
    try {
      const accessCheck = await this.verifyApprenticeAccess(userId);
      if (!accessCheck.ok) {
        return accessCheck;
      }

      const { appUser } = accessCheck.data;

      const workshops = await this.workshopRepository.findByApprenticeId(
        appUser.id
      );

      const confirmedWorkshops = workshops.filter(
        (w) => w.date && w.time && w.status !== "CANCELLED"
      );

      return success(confirmedWorkshops);
    } catch (error) {
      return failure((error as Error).message, 500);
    }
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

      const accessCheck = await this.verifyProfAccess(userId);
      const isMentor =
        accessCheck.ok && accessCheck.data.appUser.id === workshop.creatorId;

      let isApprentice = false;
      if (workshop.apprenticeId) {
        const apprenticeCheck = await this.verifyApprenticeAccess(userId);
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
        updateData.location = input.location
          ? this.sanitizeWorkshopFields({ location: input.location }).location
          : null;
      }

      await this.workshopRepository.update(workshopId, updateData);

      // TODO: System of notification will be implemented later
      // TODO: Calendar integration (Calendly) will be implemented later

      return success({ success: true });
    } catch (error) {
      return failure((error as Error).message, 500);
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
        const apprenticeCheck = await this.verifyApprenticeAccess(userId);
        isApprentice =
          apprenticeCheck.ok &&
          apprenticeCheck.data.appUser.id === workshop.apprenticeId;
      }

      let isMentor = false;
      if (!isApprentice) {
        const accessCheck = await this.verifyProfAccess(userId);
        isMentor =
          accessCheck.ok && accessCheck.data.appUser.id === workshop.creatorId;
      }

      if (!isMentor && !isApprentice) {
        return failure("Vous n'êtes pas autorisé à annuler cet atelier", 403);
      }

      if (isApprentice) {
        await this.workshopRepository.removeApprentice(workshopId);

        // Mock: Send email to apprentice
        console.log(
          `[Email] Sending cancellation confirmation to apprentice ${userId} for workshop ${workshopId}`
        );

        // Mock: Notify organizer (Anonymous if reason provided)
        if (cancellationReason) {
          console.log(
            `[Notification] Organizer notified of anonymous cancellation for workshop ${workshopId}. Reason: ${cancellationReason}`
          );
        } else {
          console.log(
            `[Notification] Organizer notified of cancellation for workshop ${workshopId}.`
          );
        }

        return success({ success: true });
      }

      await this.workshopRepository.update(workshopId, {
        status: "CANCELLED",
      });

      // TODO: System of notification will be implemented later
      // TODO: Calendar integration (Calendly) will be implemented later

      return success({ success: true });
    } catch (error) {
      return failure((error as Error).message, 500);
    }
  }

  private async verifyApprenticeAccess(
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

  private calculateWorkshopEndTime(
    date: Date | null,
    time: string | null,
    duration: number | null
  ): Date | null {
    if (!date || !time || !duration) {
      return null;
    }

    try {
      const [hours, minutes] = time.split(":").map(Number);
      const startTime = new Date(date);
      startTime.setHours(hours, minutes, 0, 0);

      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + duration);

      return endTime;
    } catch {
      return null;
    }
  }

  async getUpcomingWorkshopsForApprentice(
    userId: string
  ): Promise<Result<any[]>> {
    try {
      const accessCheck = await this.verifyApprenticeAccess(userId);
      if (!accessCheck.ok) {
        return accessCheck;
      }

      const { appUser } = accessCheck.data;
      const workshops = await this.workshopRepository.findByApprenticeId(
        appUser.id
      );

      const now = new Date();
      const upcomingWorkshops = workshops
        .filter((w) => {
          if (w.status === "CANCELLED") {
            return false;
          }

          if (w.date && w.time) {
            const endTime = this.calculateWorkshopEndTime(
              w.date,
              w.time,
              w.duration
            );
            return endTime && endTime >= now;
          }

          return !w.date || !w.time;
        })
        .sort((a, b) => {
          if (a.date && b.date) {
            return a.date.getTime() - b.date.getTime();
          }
          if (a.date && !b.date) return -1;
          if (!a.date && b.date) return 1;

          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });

      return success(upcomingWorkshops);
    } catch (error) {
      return failure((error as Error).message, 500);
    }
  }

  async getWorkshopHistoryForApprentice(
    userId: string
  ): Promise<Result<any[]>> {
    try {
      const accessCheck = await this.verifyApprenticeAccess(userId);
      if (!accessCheck.ok) {
        return accessCheck;
      }

      const { appUser } = accessCheck.data;
      const workshops = await this.workshopRepository.findByApprenticeId(
        appUser.id
      );

      const now = new Date();
      const historyWorkshops = workshops
        .filter((w) => {
          if (!w.date || !w.time) {
            return false;
          }

          const endTime = this.calculateWorkshopEndTime(
            w.date,
            w.time,
            w.duration
          );
          return endTime && endTime < now;
        })
        .sort((a, b) => {
          if (!a.date || !b.date) return 0;
          return b.date.getTime() - a.date.getTime();
        });

      return success(historyWorkshops);
    } catch (error) {
      return failure((error as Error).message, 500);
    }
  }

  async getAvailableWorkshopsForApprentice(
    userId: string
  ): Promise<Result<any[]>> {
    try {
      const accessCheck = await this.verifyApprenticeAccess(userId);
      if (!accessCheck.ok) {
        return accessCheck;
      }

      const { appUser } = accessCheck.data;

      const publishedWorkshops = await this.workshopRepository.findPublished();

      const registeredWorkshops =
        await this.workshopRepository.findByApprenticeId(appUser.id);
      const registeredWorkshopIds = new Set(
        registeredWorkshops.map((w) => w.id)
      );

      let pendingRequestWorkshopIds = new Set<string>();
      if (this.workshopRequestRepository) {
        const pendingRequests =
          await this.workshopRequestRepository.findByApprenticeId(appUser.id);
        pendingRequestWorkshopIds = new Set(
          pendingRequests
            .filter((r) => r.status === "PENDING" && r.workshopId)
            .map((r) => r.workshopId!)
        );
      }

      const availableWorkshops = publishedWorkshops.filter(
        (w) =>
          !registeredWorkshopIds.has(w.id) &&
          !pendingRequestWorkshopIds.has(w.id) &&
          w.status === "PUBLISHED" &&
          w.apprenticeId === null
      );

      return success(availableWorkshops);
    } catch (error) {
      return failure((error as Error).message, 500);
    }
  }

  private async checkResourceConflicts(
    mentorId: string,
    workshopId: string,
    newDate: Date,
    newTime: string,
    newDuration: number,
    newLocation: string | null,
    isVirtual: boolean
  ): Promise<Result<{ hasConflict: boolean; conflictMessage?: string }>> {
    try {
      const mentorWorkshops = await this.workshopRepository.findByCreatorId(
        mentorId
      );

      const newStartTime = this.calculateWorkshopStartTime(newDate, newTime);
      const newEndTime = this.calculateWorkshopEndTime(
        newDate,
        newTime,
        newDuration
      );

      if (!newStartTime || !newEndTime) {
        return failure("Impossible de calculer les horaires", 400);
      }

      for (const workshop of mentorWorkshops) {
        if (
          workshop.id === workshopId ||
          workshop.status === "CANCELLED" ||
          !workshop.date ||
          !workshop.time ||
          !workshop.duration
        ) {
          continue;
        }

        const existingStartTime = this.calculateWorkshopStartTime(
          workshop.date,
          workshop.time
        );
        const existingEndTime = this.calculateWorkshopEndTime(
          workshop.date,
          workshop.time,
          workshop.duration
        );

        if (!existingStartTime || !existingEndTime) {
          continue;
        }

        if (
          (newStartTime >= existingStartTime &&
            newStartTime < existingEndTime) ||
          (newEndTime > existingStartTime && newEndTime <= existingEndTime) ||
          (newStartTime <= existingStartTime && newEndTime >= existingEndTime)
        ) {
          return success({
            hasConflict: true,
            conflictMessage: `Vous avez déjà un atelier prévu à cette date/heure : "${workshop.title}"`,
          });
        }
      }

      if (!isVirtual && newLocation) {
        const publishedWorkshops =
          await this.workshopRepository.findPublished();
        for (const workshop of publishedWorkshops) {
          if (
            workshop.id === workshopId ||
            workshop.status === "CANCELLED" ||
            workshop.isVirtual ||
            !workshop.location ||
            !workshop.date ||
            !workshop.time ||
            !workshop.duration
          ) {
            continue;
          }

          if (
            workshop.location.toLowerCase().trim() ===
            newLocation.toLowerCase().trim()
          ) {
            const existingStartTime = this.calculateWorkshopStartTime(
              workshop.date,
              workshop.time
            );
            const existingEndTime = this.calculateWorkshopEndTime(
              workshop.date,
              workshop.time,
              workshop.duration
            );

            if (!existingStartTime || !existingEndTime) {
              continue;
            }

            if (
              (newStartTime >= existingStartTime &&
                newStartTime < existingEndTime) ||
              (newEndTime > existingStartTime &&
                newEndTime <= existingEndTime) ||
              (newStartTime <= existingStartTime &&
                newEndTime >= existingEndTime)
            ) {
              return success({
                hasConflict: true,
                conflictMessage: `Le lieu "${newLocation}" est déjà réservé à cette date/heure pour l'atelier "${workshop.title}"`,
              });
            }
          }
        }
      }

      return success({ hasConflict: false });
    } catch (error) {
      return failure((error as Error).message, 500);
    }
  }

  private calculateWorkshopStartTime(
    date: Date | null,
    time: string | null
  ): Date | null {
    if (!date || !time) {
      return null;
    }

    try {
      const [hours, minutes] = time.split(":").map(Number);
      const startTime = new Date(date);
      startTime.setHours(hours, minutes, 0, 0);
      return startTime;
    } catch {
      return null;
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

      const accessCheck = await this.verifyProfAccess(userId);
      if (!accessCheck.ok) {
        return accessCheck;
      }

      const { appUser } = accessCheck.data;
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

      if (!isMinimumTomorrow(input.date)) {
        return failure("La nouvelle date doit être au minimum demain", 400);
      }

      if (!input.time.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
        return failure("Format d'heure invalide (HH:MM requis)", 400);
      }

      const duration = input.duration ?? workshop.duration ?? 60;

      const conflictCheck = await this.checkResourceConflicts(
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
        updateData.location = input.location
          ? this.sanitizeWorkshopFields({ location: input.location }).location
          : null;
      }

      await this.workshopRepository.update(workshopId, updateData);

      const notificationResult =
        await this.notificationService.notifyWorkshopRescheduled(
          workshopId,
          oldDate,
          oldTime,
          input.date,
          input.time
        );

      if (!notificationResult.ok) {
        console.warn(
          "Erreur lors de l'envoi des notifications:",
          notificationResult.error
        );
      }

      return success({
        success: true,
        oldDate,
        oldTime,
      });
    } catch (error) {
      return failure((error as Error).message, 500);
    }
  }
}
