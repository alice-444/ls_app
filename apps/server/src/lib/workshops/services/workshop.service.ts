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
import type { INotificationService } from "../../notifications/services/notification.service.interface";
import { logger } from "../../common/logger";
import {
  handleError,
  createErrorContext,
  ErrorCategory,
} from "../../common/error-handler";
import {
  isValidTimeFormat,
  doTimeRangesOverlap,
  calculateWorkshopStartTime,
  calculateWorkshopEndTime,
  isWorkshopValidForConflictCheck,
  calculateWorkshopTimeRange,
} from "../utils/workshop-helpers";

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
    private readonly workshopRequestRepository?: IWorkshopRequestRepository,
    private readonly dbNotificationService?: INotificationService
  ) {
    this.notificationService = new WorkshopNotificationService(
      this.workshopRepository,
      this.dbNotificationService,
      this.appUserRepository
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

    return profCheck;
  }

  private async verifyWorkshopOwnership(
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
        creatorId: appUser.id,
      });

      return success({ workshopId: workshop.id });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("createWorkshop", {
          userId,
        })
      );
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
      const ownershipCheck = await this.verifyWorkshopOwnership(
        userId,
        validation.data.workshopId,
        "modifier"
      );
      if (!ownershipCheck.ok) {
        return ownershipCheck;
      }

      const { appUser } = ownershipCheck.data;

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
      const ownershipCheck = await this.verifyWorkshopOwnership(
        userId,
        validation.data.workshopId,
        "publier"
      );
      if (!ownershipCheck.ok) {
        return ownershipCheck;
      }

      const { appUser } = ownershipCheck.data;

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
      const ownershipCheck = await this.verifyWorkshopOwnership(
        userId,
        validation.data.workshopId,
        "dépublier"
      );
      if (!ownershipCheck.ok) {
        return ownershipCheck;
      }

      const { appUser } = ownershipCheck.data;

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
      const ownershipCheck = await this.verifyWorkshopOwnership(
        userId,
        validation.data.workshopId,
        "supprimer"
      );
      if (!ownershipCheck.ok) {
        return ownershipCheck;
      }

      const { appUser } = ownershipCheck.data;

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

  async getWorkshopsByCreator(userId: string): Promise<Result<any[]>> {
    try {
      const accessCheck = await this.verifyProfAccess(userId);
      if (!accessCheck.ok) {
        return accessCheck;
      }

      const { appUser } = accessCheck.data;
      // verifyProfUser guarantees appUser is not null
      if (!appUser) {
        return failure("AppUser not found", 404);
      }

      const workshops = await this.workshopRepository.findByCreatorId(
        appUser.id
      );

      return success(workshops);
    } catch (error) {
      return handleError(
        error,
        createErrorContext("getWorkshopsByCreator", { userId })
      );
    }
  }

  async getPublishedWorkshops(): Promise<Result<any[]>> {
    try {
      const workshops = await this.workshopRepository.findPublished();
      return success(workshops);
    } catch (error) {
      return handleError(error, createErrorContext("getPublishedWorkshops"));
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
      return handleError(
        error,
        createErrorContext("getWorkshopById", { resourceId: workshopId })
      );
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
      return handleError(
        error,
        createErrorContext("getConfirmedWorkshopsForApprentice", { userId })
      );
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
        accessCheck.ok &&
        accessCheck.data.appUser !== null &&
        accessCheck.data.appUser.id === workshop.creatorId;

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

      if (isMentor && this.dbNotificationService) {
        const updatedWorkshop = await this.workshopRepository.findById(
          workshopId
        );
        if (updatedWorkshop?.apprentice?.user?.id) {
          const changes: string[] = [];
          if (input.date !== undefined) changes.push("la date");
          if (input.time !== undefined) changes.push("l'heure");
          if (input.duration !== undefined) changes.push("la durée");
          if (input.location !== undefined) changes.push("le lieu");

          if (changes.length > 0) {
            const mentorName =
              updatedWorkshop.creator?.user?.name || "le mentor";
            const apprenticeUserId = updatedWorkshop.apprentice.user.id;

            await this.dbNotificationService.createNotification(
              apprenticeUserId,
              {
                type: "workshop",
                title: "Modification de l'atelier",
                message: `${mentorName} a modifié ${changes.join(
                  ", "
                )} de l'atelier "${updatedWorkshop.title}".`,
                actionUrl: `/workshop/${workshopId}`,
              },
              userId
            );
          }
        }
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
        await this.workshopRepository.removeApprentice(workshopId);

        if (this.dbNotificationService) {
          const cancelledWorkshop = await this.workshopRepository.findById(
            workshopId
          );
          if (cancelledWorkshop?.creator?.user?.id) {
            const apprenticeName =
              cancelledWorkshop.apprentice?.user?.name || "un apprenti";
            const mentorUserId = cancelledWorkshop.creator.user.id;

            const message = cancellationReason
              ? `${apprenticeName} a annulé sa participation à l'atelier "${cancelledWorkshop.title}". Raison: ${cancellationReason}`
              : `${apprenticeName} a annulé sa participation à l'atelier "${cancelledWorkshop.title}".`;

            await this.dbNotificationService.createNotification(
              mentorUserId,
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

        // TODO: Email Alert: WORKSHOP_CANCELLED
        // Send critical email to mentor when apprentice cancels participation
        // Event: WORKSHOP_CANCELLED (cancelled by apprentice)
        // Recipient: cancelledWorkshop.creator.user.email
        // Data needed: workshopTitle, workshopDate, workshopTime, apprenticeName, cancellationReason, workshopId
        // Integration point: Add email service call here after Resend implementation

        return success({ success: true });
      }

      await this.workshopRepository.update(workshopId, {
        status: "CANCELLED",
      });

      if (isMentor && this.dbNotificationService) {
        const cancelledWorkshop = await this.workshopRepository.findById(
          workshopId
        );
        if (cancelledWorkshop?.apprentice?.user?.id) {
          const mentorName =
            cancelledWorkshop.creator?.user?.name || "le mentor";
          const apprenticeUserId = cancelledWorkshop.apprentice.user.id;

          await this.dbNotificationService.createNotification(
            apprenticeUserId,
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

      logger.info("Workshop cancelled by mentor", {
        workshopId,
        mentorId: userId,
      });

      // TODO: Email Alert: WORKSHOP_CANCELLED
      // Send critical email to apprentice when mentor cancels workshop
      // Event: WORKSHOP_CANCELLED (cancelled by mentor)
      // Recipient: cancelledWorkshop.apprentice.user.email
      // Data needed: workshopTitle, workshopDate, workshopTime, mentorName, workshopId
      // Integration point: Add email service call here after Resend implementation

      return success({ success: true });
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
            const endTime = calculateWorkshopEndTime(
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
      return handleError(
        error,
        createErrorContext("getUpcomingWorkshopsForApprentice", { userId })
      );
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

          const endTime = calculateWorkshopEndTime(w.date, w.time, w.duration);
          return endTime && endTime < now;
        })
        .sort((a, b) => {
          if (!a.date || !b.date) return 0;
          return b.date.getTime() - a.date.getTime();
        });

      return success(historyWorkshops);
    } catch (error) {
      return handleError(
        error,
        createErrorContext("getWorkshopHistoryForApprentice", { userId })
      );
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
      return handleError(
        error,
        createErrorContext("getAvailableWorkshopsForApprentice", { userId })
      );
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
      const newStartTime = calculateWorkshopStartTime(newDate, newTime);
      const newEndTime = calculateWorkshopEndTime(
        newDate,
        newTime,
        newDuration
      );

      if (!newStartTime || !newEndTime) {
        return failure("Impossible de calculer les horaires", 400);
      }

      const mentorConflict = await this.checkMentorTimeConflict(
        mentorId,
        workshopId,
        newStartTime,
        newEndTime
      );

      if (mentorConflict) {
        return mentorConflict;
      }

      if (!isVirtual && newLocation) {
        const locationConflict = await this.checkLocationConflict(
          workshopId,
          newLocation,
          newStartTime,
          newEndTime
        );

        if (locationConflict) {
          return locationConflict;
        }
      }

      return success({ hasConflict: false });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("checkResourceConflicts", {
          resourceId: workshopId,
          details: { mentorId, newDate, newTime },
        })
      );
    }
  }

  private async checkMentorTimeConflict(
    mentorId: string,
    workshopId: string,
    newStartTime: Date,
    newEndTime: Date
  ): Promise<Result<{
    hasConflict: boolean;
    conflictMessage?: string;
  }> | null> {
    const mentorWorkshops = await this.workshopRepository.findByCreatorId(
      mentorId
    );

    for (const workshop of mentorWorkshops) {
      if (!isWorkshopValidForConflictCheck(workshop, workshopId)) {
        continue;
      }

      const { startTime: existingStartTime, endTime: existingEndTime } =
        calculateWorkshopTimeRange(workshop);

      if (!existingStartTime || !existingEndTime) {
        continue;
      }

      if (
        doTimeRangesOverlap(
          newStartTime,
          newEndTime,
          existingStartTime,
          existingEndTime
        )
      ) {
        return success({
          hasConflict: true,
          conflictMessage: `Vous avez déjà un atelier prévu à cette date/heure : "${workshop.title}"`,
        });
      }
    }

    return null;
  }

  private async checkLocationConflict(
    workshopId: string,
    newLocation: string,
    newStartTime: Date,
    newEndTime: Date
  ): Promise<Result<{
    hasConflict: boolean;
    conflictMessage?: string;
  }> | null> {
    const publishedWorkshops = await this.workshopRepository.findPublished();

    for (const workshop of publishedWorkshops) {
      if (
        !isWorkshopValidForConflictCheck(workshop, workshopId) ||
        workshop.isVirtual ||
        !workshop.location ||
        workshop.location.toLowerCase().trim() !==
          newLocation.toLowerCase().trim()
      ) {
        continue;
      }

      const { startTime: existingStartTime, endTime: existingEndTime } =
        calculateWorkshopTimeRange(workshop);

      if (!existingStartTime || !existingEndTime) {
        continue;
      }

      if (
        doTimeRangesOverlap(
          newStartTime,
          newEndTime,
          existingStartTime,
          existingEndTime
        )
      ) {
        return success({
          hasConflict: true,
          conflictMessage: `Le lieu "${newLocation}" est déjà réservé à cette date/heure pour l'atelier "${workshop.title}"`,
        });
      }
    }

    return null;
  }

  private validateRescheduleInput(
    input: { date: Date; time: string },
    workshop: any
  ): Result<any> | null {
    if (!isMinimumTomorrow(input.date)) {
      return failure("La nouvelle date doit être au minimum demain", 400);
    }

    if (!isValidTimeFormat(input.time)) {
      return failure("Format d'heure invalide (HH:MM requis)", 400);
    }

    return null;
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

      const validationError = this.validateRescheduleInput(input, workshop);
      if (validationError) {
        return validationError;
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
      const newDate = input.date;
      const newTime = input.time;

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
          input.time,
          userId
        );

      if (!notificationResult.ok) {
        logger.error(
          "Erreur lors de l'envoi des notifications",
          notificationResult.error,
          {
            workshopId,
            userId,
          }
        );
      }

      return success({
        success: true,
        oldDate,
        oldTime,
      });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("rescheduleWorkshop", {
          userId,
          resourceId: workshopId,
          details: {
            newDate: input.date,
            newTime: input.time,
          },
        })
      );
    }
  }
}
