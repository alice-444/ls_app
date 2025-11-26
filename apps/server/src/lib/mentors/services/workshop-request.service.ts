import type { Result } from "../../common";
import { failure, success } from "../../common";
import type { IWorkshopRequestService } from "./workshop-request.service.interface";
import type { IWorkshopRequestRepository } from "../repositories/workshop-request.repository.interface";
import type { IMentorRepository } from "../repositories/mentor.repository.interface";
import type { IWorkshopRepository } from "../../workshops/repositories/workshop.repository.interface";
import type { INotificationService } from "../../notifications/services/notification.service.interface";
import { sanitizeString } from "../../utils/sanitize";
import { sanitizeLocation } from "../../workshops/utils/workshop-helpers";
import { logger } from "../../common/logger";
import { handleError, createErrorContext } from "../../common/error-handler";
import type { ICreditService } from "../../credits/services/credit.service.interface";
import type { PrismaClient } from "../../../../prisma/generated/client/client";
import { generateInternalId } from "../../utils/id-generator";

export class WorkshopRequestService implements IWorkshopRequestService {
  constructor(
    private readonly workshopRequestRepository: IWorkshopRequestRepository,
    private readonly mentorRepository: IMentorRepository,
    private readonly workshopRepository: IWorkshopRepository,
    private readonly notificationService?: INotificationService,
    private readonly creditService?: ICreditService,
    private readonly prisma?: PrismaClient
  ) {}

  private readonly WORKSHOP_REQUEST_COST = 10;

  async submitWorkshopRequest(
    userId: string,
    input: {
      mentorId: string;
      title: string;
      description?: string | null;
      message?: string | null;
      preferredDate?: Date | null;
      preferredTime?: string | null;
      workshopId?: string | null;
    }
  ): Promise<Result<{ requestId: string }>> {
    try {
      const mentor = await this.mentorRepository.findPublishedMentorById(
        input.mentorId
      );

      if (!mentor) {
        return failure("Mentor introuvable ou non publié", 404);
      }

      const apprentice = await this.mentorRepository.findApprenticeByUserId(
        userId
      );

      if (!apprentice) {
        return failure(
          "Utilisateur introuvable. Veuillez compléter votre profil d'apprenant.",
          404
        );
      }

      if (mentor.id === apprentice.id) {
        return failure("Vous ne pouvez pas faire une demande à vous-même", 400);
      }

      const sanitizedTitle = sanitizeString(input.title, {
        maxLength: 100,
        trim: true,
      });
      const sanitizedDescription = input.description
        ? sanitizeString(input.description, {
            maxLength: 100,
            trim: true,
          })
        : null;
      const sanitizedMessage = input.message
        ? sanitizeString(input.message, {
            maxLength: 1000,
            trim: true,
          })
        : null;

      if (this.prisma && this.creditService) {
        const result = await this.prisma.$transaction(async (tx) => {
          const debitResult =
            await this.creditService!.debitCreditsInTransaction(
              userId,
              this.WORKSHOP_REQUEST_COST,
              `Demande d'atelier: ${sanitizedTitle}`,
              tx
            );

          if (!debitResult.ok) {
            throw new Error(debitResult.error);
          }

          // Créer la demande d'atelier dans la même transaction
          const now = new Date();
          const workshopRequest = await (tx as any).workshop_request.create({
            data: {
              id: generateInternalId(),
              title: sanitizedTitle,
              description: sanitizedDescription ?? null,
              message: sanitizedMessage ?? null,
              preferredDate: input.preferredDate ?? null,
              preferredTime: input.preferredTime ?? null,
              apprenticeId: apprentice.id,
              mentorId: mentor.id,
              workshopId: input.workshopId ?? null,
              createdAt: now,
              updatedAt: now,
            },
            include: {
              app_user_workshop_request_apprenticeIdToapp_user: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
              app_user_workshop_request_mentorIdToapp_user: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          });

          return {
            ...workshopRequest,
            apprentice:
              workshopRequest.app_user_workshop_request_apprenticeIdToapp_user,
            mentor:
              workshopRequest.app_user_workshop_request_mentorIdToapp_user,
          };
        });

        const workshopRequest = result as any;

        logger.info("Workshop request created", {
          requestId: workshopRequest.id,
          apprenticeId: apprentice.id,
          mentorId: mentor.id,
          title: sanitizedTitle,
          creditsUsed: this.WORKSHOP_REQUEST_COST,
        });

        if (this.notificationService && workshopRequest.mentor?.user?.id) {
          const apprenticeName =
            workshopRequest.apprentice?.user?.name || "un apprenti";
          const mentorUserId = workshopRequest.mentor.user.id;

          await this.notificationService.createNotification(
            mentorUserId,
            {
              type: "workshop",
              title: "Nouvelle demande d'atelier",
              message: `${apprenticeName} vous a envoyé une demande pour l'atelier "${sanitizedTitle}".`,
              actionUrl: `/dashboard/workshop-requests`,
            },
            userId
          );
        }

        return success({ requestId: workshopRequest.id });
      } else {
        const workshopRequest = await this.workshopRequestRepository.create({
          title: sanitizedTitle,
          description: sanitizedDescription,
          message: sanitizedMessage,
          preferredDate: input.preferredDate ?? null,
          preferredTime: input.preferredTime ?? null,
          apprenticeId: apprentice.id,
          mentorId: mentor.id,
          workshopId: input.workshopId ?? null,
        });

        logger.info("Workshop request created", {
          requestId: workshopRequest.id,
          apprenticeId: apprentice.id,
          mentorId: mentor.id,
          title: sanitizedTitle,
        });

        if (this.notificationService) {
          const requestWithRelations =
            await this.workshopRequestRepository.findById(workshopRequest.id);

          if (requestWithRelations?.mentor?.user?.id) {
            const apprenticeName =
              requestWithRelations.apprentice?.user?.name || "un apprenti";
            const mentorUserId = requestWithRelations.mentor.user.id;

            await this.notificationService.createNotification(
              mentorUserId,
              {
                type: "workshop",
                title: "Nouvelle demande d'atelier",
                message: `${apprenticeName} vous a envoyé une demande pour l'atelier "${sanitizedTitle}".`,
                actionUrl: `/dashboard/workshop-requests`,
              },
              userId
            );
          }
        }

        return success({ requestId: workshopRequest.id });
      }
    } catch (error) {
      return handleError(
        error,
        createErrorContext("submitWorkshopRequest", {
          userId,
          details: { mentorId: input.mentorId },
        })
      );
    }
  }

  async getApprenticeRequests(userId: string): Promise<Result<Array<any>>> {
    try {
      const apprentice = await this.mentorRepository.findApprenticeByUserId(
        userId
      );

      if (!apprentice) {
        return failure("Utilisateur introuvable", 404);
      }

      const requests = await this.workshopRequestRepository.findByApprenticeId(
        apprentice.id
      );

      return success(requests);
    } catch (error) {
      return handleError(
        error,
        createErrorContext("getApprenticeRequests", { userId })
      );
    }
  }

  async getMentorRequests(userId: string): Promise<Result<Array<any>>> {
    try {
      const mentor = await this.mentorRepository.findMentorById(userId);

      if (!mentor) {
        return failure("Mentor introuvable", 404);
      }

      const requests = await this.workshopRequestRepository.findByMentorId(
        mentor.id
      );

      return success(requests);
    } catch (error) {
      return handleError(
        error,
        createErrorContext("getMentorRequests", { userId })
      );
    }
  }

  async getWorkshopRequests(workshopId: string): Promise<Result<Array<any>>> {
    try {
      const requests = await this.workshopRequestRepository.findByWorkshopId(
        workshopId
      );

      return success(requests);
    } catch (error) {
      return handleError(
        error,
        createErrorContext("getWorkshopRequests", { resourceId: workshopId })
      );
    }
  }

  async acceptWorkshopRequest(
    userId: string,
    requestId: string,
    input: {
      date: Date;
      time: string;
      duration?: number | null;
      location?: string | null;
      isVirtual?: boolean;
      maxParticipants?: number | null;
    }
  ): Promise<Result<{ workshopId: string; requestId: string }>> {
    let mentor: any = null;
    let request: any = null;
    try {
      mentor = await this.mentorRepository.findMentorById(userId);
      if (!mentor) {
        return failure("Mentor introuvable", 404);
      }

      request = await this.workshopRequestRepository.findById(requestId);
      if (!request) {
        return failure("Demande d'atelier introuvable", 404);
      }

      if (request.mentorId !== mentor.id) {
        return failure(
          "Vous n'êtes pas autorisé à accepter cette demande",
          403
        );
      }

      if (!this.prisma) {
        return failure("Prisma client not available", 500);
      }

      const result = await this.prisma.$transaction(
        async (tx) => {
          const lockedRequest =
            await this.workshopRequestRepository.findByIdWithLock(
              requestId,
              tx
            );

          if (!lockedRequest) {
            throw new Error("Demande d'atelier introuvable");
          }

          if (lockedRequest.status !== "PENDING") {
            throw new Error(
              `Cette demande ne peut pas être acceptée. Statut actuel: ${lockedRequest.status}`
            );
          }

          const updateResult = await (tx as any).workshop_request.updateMany({
            where: {
              id: requestId,
              status: "PENDING",
            },
            data: {
              status: "ACCEPTED",
              updatedAt: new Date(),
            },
          });

          if (updateResult.count === 0) {
            throw new Error(
              "Cette demande ne peut pas être acceptée. Le statut a changé entre temps."
            );
          }

          if (lockedRequest.workshopId) {
            const existingWorkshop = await this.workshopRepository.findById(
              lockedRequest.workshopId
            );

            if (existingWorkshop) {
              const maxParticipants =
                input.maxParticipants ?? existingWorkshop.maxParticipants;

              if (maxParticipants !== null && maxParticipants > 0) {
                const acceptedCount =
                  await this.workshopRequestRepository.countAcceptedByWorkshopId(
                    lockedRequest.workshopId,
                    tx
                  );

                if (acceptedCount + 1 > maxParticipants) {
                  throw new Error(
                    `Cet atelier est complet. Nombre maximum de participants atteint (${
                      acceptedCount + 1
                    }/${maxParticipants}).`
                  );
                }
              }
            }
          }

          const workshop = await this.createOrUpdateWorkshopForRequest(
            lockedRequest,
            mentor.id,
            input,
            tx
          );

          if (!workshop.ok) {
            throw new Error(workshop.error);
          }

          await (tx as any).workshop_request.update({
            where: { id: requestId },
            data: { workshopId: workshop.data.id },
          });

          return { workshop, request: lockedRequest };
        },
        {
          isolationLevel: "Serializable",
          timeout: 10000,
        }
      );

      const { workshop, request: updatedRequest } = result;

      logger.info("Workshop request accepted", {
        requestId,
        workshopId: workshop.data.id,
        mentorId: mentor.id,
        apprenticeId: updatedRequest.apprenticeId,
      });

      if (this.notificationService) {
        const requestWithRelations =
          await this.workshopRequestRepository.findById(requestId);

        if (requestWithRelations?.apprentice?.user?.id) {
          const workshopDetails = await this.workshopRepository.findById(
            workshop.data.id
          );
          const mentorName =
            requestWithRelations.mentor?.user?.name || "le mentor";
          const workshopTitle = workshopDetails?.title || request.title;
          const apprenticeUserId = requestWithRelations.apprentice.user.id;

          logger.debug("Creating notification for apprentice", {
            apprenticeUserId,
            workshopId: workshop.data.id,
            mentorName,
            workshopTitle,
          });

          const notificationResult =
            await this.notificationService.createNotification(
              apprenticeUserId,
              {
                type: "workshop",
                title: "Demande d'atelier acceptée",
                message: `${mentorName} a accepté votre demande pour l'atelier "${workshopTitle}".`,
                actionUrl: `/workshop/${workshop.data.id}`,
              },
              userId
            );

          if (!notificationResult.ok) {
            logger.error(
              "Failed to create notification",
              notificationResult.error,
              {
                apprenticeUserId,
                workshopId: workshop.data.id,
              }
            );
          } else {
            logger.debug("Notification created successfully", {
              notificationId: notificationResult.data.id,
              apprenticeUserId,
            });
          }
        } else {
          logger.warn("Cannot create notification: apprentice user not found", {
            requestId,
            hasApprentice: !!requestWithRelations?.apprentice,
            hasUser: !!requestWithRelations?.apprentice?.user,
            hasUserId: !!requestWithRelations?.apprentice?.user?.id,
          });
        }
      } else {
        logger.warn("Notification service not available", { requestId });
      }

      // TODO: Send critical email to apprentice when workshop request is accepted
      // Event: WORKSHOP_REGISTERED
      // Recipient: requestWithRelations.apprentice.user.email
      // Data needed: workshopTitle, workshopDate, workshopTime, workshopLocation, mentorName, workshopId
      // Integration point: Add email service call here after Resend implementation

      return success({
        workshopId: workshop.data.id,
        requestId: updatedRequest.id,
      });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("acceptWorkshopRequest", {
          userId,
          resourceId: requestId,
          details: { mentorId: mentor.id, apprenticeId: request.apprenticeId },
        })
      );
    }
  }

  private async createOrUpdateWorkshopForRequest(
    request: any,
    mentorId: string,
    input: {
      date: Date;
      time: string;
      duration?: number | null;
      location?: string | null;
      isVirtual?: boolean;
      maxParticipants?: number | null;
    },
    tx?: any
  ): Promise<Result<{ id: string }>> {
    if (request.workshopId) {
      return this.updateExistingWorkshopForRequest(
        request,
        mentorId,
        input,
        tx
      );
    }

    return this.createNewWorkshopForRequest(request, mentorId, input);
  }

  private async updateExistingWorkshopForRequest(
    request: any,
    mentorId: string,
    input: {
      date: Date;
      time: string;
      duration?: number | null;
      location?: string | null;
      isVirtual?: boolean;
      maxParticipants?: number | null;
    },
    tx?: any
  ): Promise<Result<{ id: string }>> {
    const existingWorkshop = await this.workshopRepository.findById(
      request.workshopId
    );

    if (!existingWorkshop) {
      return failure("L'atelier référencé n'existe pas", 404);
    }

    if (existingWorkshop.creatorId !== mentorId) {
      return failure(
        "Vous n'êtes pas autorisé à accepter cette demande pour cet atelier",
        403
      );
    }

    const maxParticipants =
      input.maxParticipants ?? existingWorkshop.maxParticipants;

    if (maxParticipants !== null && maxParticipants > 0) {
      const acceptedCount =
        await this.workshopRequestRepository.countAcceptedByWorkshopId(
          request.workshopId,
          tx
        );

      if (acceptedCount + 1 > maxParticipants) {
        return failure(
          `Cet atelier est complet. Nombre maximum de participants atteint (${
            acceptedCount + 1
          }/${maxParticipants}).`,
          400
        );
      }
    }

    const sanitizedLocation = sanitizeLocation(
      input.location ?? existingWorkshop.location
    );

    const updateData: any = {
      date: input.date,
      time: input.time,
      duration: input.duration ?? existingWorkshop.duration ?? undefined,
      location: sanitizedLocation,
      isVirtual: input.isVirtual ?? existingWorkshop.isVirtual,
      maxParticipants:
        input.maxParticipants ?? existingWorkshop.maxParticipants ?? undefined,
    };

    if (!existingWorkshop.apprenticeId) {
      updateData.apprenticeId = request.apprenticeId;
    }

    const workshop = await this.workshopRepository.update(
      request.workshopId,
      updateData
    );

    return success({ id: workshop.id });
  }

  private async createNewWorkshopForRequest(
    request: any,
    mentorId: string,
    input: {
      date: Date;
      time: string;
      duration?: number | null;
      location?: string | null;
      isVirtual?: boolean;
      maxParticipants?: number | null;
    }
  ): Promise<Result<{ id: string }>> {
    const sanitizedLocation = sanitizeLocation(input.location);

    const workshop = await this.workshopRepository.create({
      title: request.title,
      description: request.description,
      date: input.date,
      time: input.time,
      duration: input.duration ?? null,
      location: sanitizedLocation,
      isVirtual: input.isVirtual ?? false,
      maxParticipants: input.maxParticipants ?? null,
      materialsNeeded: null,
      creatorId: mentorId,
      apprenticeId: request.apprenticeId,
      requestId: request.id,
    });

    return success({ id: workshop.id });
  }

  async rejectWorkshopRequest(
    userId: string,
    requestId: string
  ): Promise<Result<{ success: boolean }>> {
    try {
      const mentor = await this.mentorRepository.findMentorById(userId);
      if (!mentor) {
        return failure("Mentor introuvable", 404);
      }

      const request = await this.workshopRequestRepository.findById(requestId);
      if (!request) {
        return failure("Demande d'atelier introuvable", 404);
      }

      if (request.mentorId !== mentor.id) {
        return failure("Vous n'êtes pas autorisé à rejeter cette demande", 403);
      }

      if (request.status !== "PENDING") {
        return failure(
          `Cette demande ne peut pas être rejetée. Statut actuel: ${request.status}`,
          400
        );
      }

      await this.workshopRequestRepository.update(requestId, {
        status: "REJECTED",
      });

      logger.info("Workshop request rejected", {
        requestId,
        mentorId: mentor.id,
        apprenticeId: request.apprenticeId,
      });

      if (this.notificationService) {
        const requestWithRelations =
          await this.workshopRequestRepository.findById(requestId);

        if (requestWithRelations?.apprentice?.user?.id) {
          const mentorName =
            requestWithRelations.mentor?.user?.name || "le mentor";
          const apprenticeUserId = requestWithRelations.apprentice.user.id;

          await this.notificationService.createNotification(
            apprenticeUserId,
            {
              type: "workshop",
              title: "Demande d'atelier rejetée",
              message: `${mentorName} a rejeté votre demande pour l'atelier "${request.title}".`,
              actionUrl: `/workshop-room`,
            },
            userId
          );
        }
      }

      return success({ success: true });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("rejectWorkshopRequest", {
          userId,
          resourceId: requestId,
        })
      );
    }
  }

  async cancelWorkshopRequest(
    userId: string,
    requestId: string
  ): Promise<Result<{ success: boolean }>> {
    try {
      const request = await this.workshopRequestRepository.findById(requestId);
      if (!request) {
        return failure("Demande d'atelier introuvable", 404);
      }

      const apprentice = await this.mentorRepository.findApprenticeByUserId(
        userId
      );
      const mentor = await this.mentorRepository.findMentorById(userId);

      const isApprentice = apprentice?.id === request.apprenticeId;
      const isMentor = mentor?.id === request.mentorId;

      if (!isApprentice && !isMentor) {
        return failure("Vous n'êtes pas autorisé à annuler cette demande", 403);
      }

      if (request.status === "CANCELLED") {
        return failure("Cette demande est déjà annulée", 400);
      }

      if (request.status === "ACCEPTED" && request.workshopId) {
        return failure(
          "Cette demande a été acceptée et un atelier a été créé. Veuillez annuler l'atelier directement.",
          400
        );
      }

      await this.workshopRequestRepository.update(requestId, {
        status: "CANCELLED",
      });

      logger.info("Workshop request cancelled", {
        requestId,
        cancelledBy: isApprentice ? "apprentice" : "mentor",
        userId,
      });

      if (this.notificationService) {
        const requestWithRelations =
          await this.workshopRequestRepository.findById(requestId);

        if (isApprentice && requestWithRelations?.mentor?.user?.id) {
          const apprenticeName =
            requestWithRelations.apprentice?.user?.name || "un apprenti";
          const mentorUserId = requestWithRelations.mentor.user.id;

          await this.notificationService.createNotification(
            mentorUserId,
            {
              type: "workshop",
              title: "Demande d'atelier annulée",
              message: `${apprenticeName} a annulé sa demande pour l'atelier "${request.title}".`,
              actionUrl: `/dashboard/workshop-requests`,
            },
            userId
          );
        } else if (isMentor && requestWithRelations?.apprentice?.user?.id) {
          const mentorName =
            requestWithRelations.mentor?.user?.name || "le mentor";
          const apprenticeUserId = requestWithRelations.apprentice.user.id;

          await this.notificationService.createNotification(
            apprenticeUserId,
            {
              type: "workshop",
              title: "Demande d'atelier annulée",
              message: `${mentorName} a annulé votre demande pour l'atelier "${request.title}".`,
              actionUrl: `/workshop-room`,
            },
            userId
          );
        }
      }

      return success({ success: true });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("cancelWorkshopRequest", {
          userId,
          resourceId: requestId,
        })
      );
    }
  }

  async updateWorkshopRequest(
    userId: string,
    requestId: string,
    input: {
      title?: string;
      description?: string | null;
      message?: string | null;
      preferredDate?: Date | null;
      preferredTime?: string | null;
      mentorId?: string;
    }
  ): Promise<Result<{ requestId: string }>> {
    try {
      const request = await this.workshopRequestRepository.findById(requestId);
      if (!request) {
        return failure("Demande d'atelier introuvable", 404);
      }

      const apprentice = await this.mentorRepository.findApprenticeByUserId(
        userId
      );
      if (!apprentice || apprentice.id !== request.apprenticeId) {
        return failure(
          "Vous n'êtes pas autorisé à modifier cette demande",
          403
        );
      }

      if (request.status !== "REJECTED" && request.status !== "CANCELLED") {
        return failure(
          `Cette demande ne peut pas être modifiée. Statut actuel: ${request.status}`,
          400
        );
      }

      let mentorId = request.mentorId;
      if (input.mentorId && input.mentorId !== request.mentorId) {
        const newMentor = await this.mentorRepository.findMentorById(
          input.mentorId
        );
        if (!newMentor) {
          return failure("Mentor introuvable", 404);
        }
        mentorId = newMentor.id;
      }

      const updateData: any = {
        status: "PENDING",
      };

      if (input.title !== undefined) {
        updateData.title = input.title;
      }
      if (input.description !== undefined) {
        updateData.description = input.description;
      }
      if (input.message !== undefined) {
        updateData.message = input.message;
      }
      if (input.preferredDate !== undefined) {
        updateData.preferredDate = input.preferredDate;
      }
      if (input.preferredTime !== undefined) {
        updateData.preferredTime = input.preferredTime;
      }
      if (mentorId !== request.mentorId) {
        updateData.mentorId = mentorId;
      }

      await this.workshopRequestRepository.update(requestId, updateData);

      logger.info("Workshop request updated", {
        requestId,
        apprenticeId: apprentice.id,
        changes: Object.keys(updateData).filter((key) => key !== "status"),
      });

      if (this.notificationService) {
        const requestWithRelations =
          await this.workshopRequestRepository.findById(requestId);

        if (requestWithRelations?.mentor?.user?.id) {
          const apprenticeName =
            requestWithRelations.apprentice?.user?.name || "un apprenti";
          const mentorUserId = requestWithRelations.mentor.user.id;

          const changes: string[] = [];
          if (input.title !== undefined) changes.push("le titre");
          if (input.description !== undefined) changes.push("la description");
          if (input.message !== undefined) changes.push("le message");
          if (input.preferredDate !== undefined)
            changes.push("la date préférée");
          if (input.preferredTime !== undefined)
            changes.push("l'heure préférée");
          if (input.mentorId && input.mentorId !== request.mentorId)
            changes.push("le mentor");

          const changesText =
            changes.length > 0
              ? ` a modifié ${changes.join(", ")}`
              : " a mis à jour";

          await this.notificationService.createNotification(
            mentorUserId,
            {
              type: "workshop",
              title: "Demande d'atelier modifiée",
              message: `${apprenticeName}${changesText} de sa demande pour l'atelier "${
                requestWithRelations.title || request.title
              }".`,
              actionUrl: `/dashboard/workshop-requests`,
            },
            userId
          );
        }
      }

      return success({ requestId });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("updateWorkshopRequest", {
          userId,
          resourceId: requestId,
        })
      );
    }
  }
}
