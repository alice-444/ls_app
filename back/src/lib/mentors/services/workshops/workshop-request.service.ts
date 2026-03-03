import type { Result } from "../../../common";
import { failure, success } from "../../../common";
import type { IWorkshopRequestService } from "./workshop-request.service.interface";
import type { IWorkshopRequestRepository } from "../../repositories/workshop-request.repository.interface";
import type { IMentorRepository } from "../../repositories/mentor.repository.interface";
import type { IWorkshopRepository } from "../../../workshops/repositories/workshop.repository.interface";
import type { IWorkshopRequestNotificationService } from "./workshop-request-notification.service";
import type { IWorkshopRequestQueryService } from "./workshop-request-query.service";
import type { IWorkshopForRequestFactory } from "./workshop-for-request.factory";
import { WorkshopRequestQueryService } from "./workshop-request-query.service";
import { WorkshopForRequestFactory } from "./workshop-for-request.factory";
import { sanitizeString } from "../../../utils/sanitize";
import { logger } from "../../../common/logger";
import { handleError, createErrorContext } from "../../../common/error-handler";
import type { ICreditService } from "../../../credits/services/credit.service.interface";
import type { PrismaClient } from "../../../../../prisma/generated/client/client";
import { generateInternalId } from "../../../utils/id-generator";

export class WorkshopRequestService implements IWorkshopRequestService {
  private readonly WORKSHOP_REQUEST_COST = 10;
  private readonly queryService: IWorkshopRequestQueryService;
  private readonly workshopFactory: IWorkshopForRequestFactory;

  constructor(
    private readonly workshopRequestRepository: IWorkshopRequestRepository,
    private readonly mentorRepository: IMentorRepository,
    private readonly workshopRepository: IWorkshopRepository,
    private readonly notificationService: IWorkshopRequestNotificationService,
    private readonly creditService?: ICreditService,
    private readonly prisma?: PrismaClient
  ) {
    this.queryService = new WorkshopRequestQueryService(
      workshopRequestRepository,
      mentorRepository
    );
    this.workshopFactory = new WorkshopForRequestFactory(
      workshopRepository,
      workshopRequestRepository
    );
  }

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
        ? sanitizeString(input.description, { maxLength: 100, trim: true })
        : null;
      const sanitizedMessage = input.message
        ? sanitizeString(input.message, { maxLength: 1000, trim: true })
        : null;

      const workshopRequest =
        this.prisma && this.creditService
          ? await this.submitWithCredits(
              userId,
              apprentice,
              mentor,
              sanitizedTitle,
              sanitizedDescription,
              sanitizedMessage,
              input
            )
          : await this.submitWithoutCredits(
              apprentice,
              mentor,
              sanitizedTitle,
              sanitizedDescription,
              sanitizedMessage,
              input
            );

      await this.notificationService.notifyMentorOfNewRequest(
        workshopRequest,
        userId,
        sanitizedTitle
      );

      return success({ requestId: workshopRequest.id });
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

  private async submitWithCredits(
    userId: string,
    apprentice: any,
    mentor: any,
    sanitizedTitle: string,
    sanitizedDescription: string | null,
    sanitizedMessage: string | null,
    input: any
  ): Promise<any> {
    const result = await this.prisma!.$transaction(async (tx) => {
      const debitResult = await this.creditService!.debitCreditsInTransaction(
        userId,
        this.WORKSHOP_REQUEST_COST,
        `Demande d'atelier: ${sanitizedTitle}`,
        tx
      );

      if (!debitResult.ok) {
        throw new Error(debitResult.error);
      }

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
          user_workshop_request_apprenticeIdTouser: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
          user_workshop_request_mentorIdTouser: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      });

      return {
        ...workshopRequest,
        apprentice:
          workshopRequest.user_workshop_request_apprenticeIdTouser,
        mentor:
          workshopRequest.user_workshop_request_mentorIdTouser,
      };
    });

    logger.info("Workshop request created", {
      requestId: result.id,
      apprenticeId: apprentice.id,
      mentorId: mentor.id,
      title: sanitizedTitle,
      creditsUsed: this.WORKSHOP_REQUEST_COST,
    });

    return result;
  }

  private async submitWithoutCredits(
    apprentice: any,
    mentor: any,
    sanitizedTitle: string,
    sanitizedDescription: string | null,
    sanitizedMessage: string | null,
    input: any
  ): Promise<any> {
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

    return workshopRequest;
  }

  getApprenticeRequests(userId: string): Promise<Result<Array<any>>> {
    return this.queryService.getApprenticeRequests(userId);
  }

  getMentorRequests(userId: string): Promise<Result<Array<any>>> {
    return this.queryService.getMentorRequests(userId);
  }

  getWorkshopRequests(workshopId: string): Promise<Result<Array<any>>> {
    return this.queryService.getWorkshopRequests(workshopId);
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
            where: { id: requestId, status: "PENDING" },
            data: { status: "ACCEPTED", updatedAt: new Date() },
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
                    `Cet atelier est complet. Nombre maximum de participants atteint (${acceptedCount + 1}/${maxParticipants}).`
                  );
                }
              }
            }
          }

          const workshop =
            await this.workshopFactory.createOrUpdateWorkshopForRequest(
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
        { isolationLevel: "Serializable", timeout: 10000 }
      );

      const { workshop, request: updatedRequest } = result;

      logger.info("Workshop request accepted", {
        requestId,
        workshopId: workshop.data.id,
        mentorId: mentor.id,
        apprenticeId: updatedRequest.apprenticeId,
      });

      await this.notificationService.notifyAndEmailAcceptance(
        requestId,
        workshop.data.id,
        request.title,
        userId
      );

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
          details: {
            mentorId: mentor?.id,
            apprenticeId: request?.apprenticeId,
          },
        })
      );
    }
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

      const request =
        await this.workshopRequestRepository.findById(requestId);
      if (!request) {
        return failure("Demande d'atelier introuvable", 404);
      }

      if (request.mentorId !== mentor.id) {
        return failure(
          "Vous n'êtes pas autorisé à rejeter cette demande",
          403
        );
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

      await this.notificationService.notifyAndEmailRejection(
        requestId,
        request.title,
        userId
      );

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
      const request =
        await this.workshopRequestRepository.findById(requestId);
      if (!request) {
        return failure("Demande d'atelier introuvable", 404);
      }

      const apprentice =
        await this.mentorRepository.findApprenticeByUserId(userId);
      const mentor = await this.mentorRepository.findMentorById(userId);

      const isApprentice = apprentice?.id === request.apprenticeId;
      const isMentor = mentor?.id === request.mentorId;

      if (!isApprentice && !isMentor) {
        return failure(
          "Vous n'êtes pas autorisé à annuler cette demande",
          403
        );
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

      await this.notificationService.notifyCancellation(
        requestId,
        request.title,
        userId,
        isApprentice
      );

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
      const request =
        await this.workshopRequestRepository.findById(requestId);
      if (!request) {
        return failure("Demande d'atelier introuvable", 404);
      }

      const apprentice =
        await this.mentorRepository.findApprenticeByUserId(userId);
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

      const updateData: any = { status: "PENDING" };

      if (input.title !== undefined) updateData.title = input.title;
      if (input.description !== undefined)
        updateData.description = input.description;
      if (input.message !== undefined) updateData.message = input.message;
      if (input.preferredDate !== undefined)
        updateData.preferredDate = input.preferredDate;
      if (input.preferredTime !== undefined)
        updateData.preferredTime = input.preferredTime;
      if (mentorId !== request.mentorId) updateData.mentorId = mentorId;

      await this.workshopRequestRepository.update(requestId, updateData);

      logger.info("Workshop request updated", {
        requestId,
        apprenticeId: apprentice.id,
        changes: Object.keys(updateData).filter((key) => key !== "status"),
      });

      await this.notificationService.notifyMentorOfUpdate(
        requestId,
        request,
        input,
        userId
      );

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
