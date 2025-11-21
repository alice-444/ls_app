import type { Result } from "../../common";
import { failure, success } from "../../common";
import type { IWorkshopRequestService } from "./workshop-request.service.interface";
import type { IWorkshopRequestRepository } from "../repositories/workshop-request.repository.interface";
import type { IMentorRepository } from "../repositories/mentor.repository.interface";
import type { IWorkshopRepository } from "../../workshops/repositories/workshop.repository.interface";
import { sanitizeString } from "../../utils/sanitize";

export class WorkshopRequestService implements IWorkshopRequestService {
  constructor(
    private readonly workshopRequestRepository: IWorkshopRequestRepository,
    private readonly mentorRepository: IMentorRepository,
    private readonly workshopRepository: IWorkshopRepository
  ) {}

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

      const sanitizedTitle = sanitizeString(input.title);
      const sanitizedDescription = input.description
        ? sanitizeString(input.description)
        : null;
      const sanitizedMessage = input.message
        ? sanitizeString(input.message)
        : null;

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

      // TODO: System of notification will be implemented later

      return success({ requestId: workshopRequest.id });
    } catch (error) {
      return failure((error as Error).message, 500);
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
      return failure((error as Error).message, 500);
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
      return failure((error as Error).message, 500);
    }
  }

  async getWorkshopRequests(workshopId: string): Promise<Result<Array<any>>> {
    try {
      const requests = await this.workshopRequestRepository.findByWorkshopId(
        workshopId
      );

      return success(requests);
    } catch (error) {
      return failure((error as Error).message, 500);
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
        return failure(
          "Vous n'êtes pas autorisé à accepter cette demande",
          403
        );
      }

      if (request.status !== "PENDING") {
        return failure(
          `Cette demande ne peut pas être acceptée. Statut actuel: ${request.status}`,
          400
        );
      }

      let workshop;

      if (request.workshopId) {
        const existingWorkshop = await this.workshopRepository.findById(
          request.workshopId
        );

        if (!existingWorkshop) {
          return failure("L'atelier référencé n'existe pas", 404);
        }

        if (existingWorkshop.creatorId !== mentor.id) {
          return failure(
            "Vous n'êtes pas autorisé à accepter cette demande pour cet atelier",
            403
          );
        }

        if (existingWorkshop.apprenticeId) {
          return failure(
            "Cet atelier a déjà un participant. Un atelier ne peut avoir qu'un seul participant.",
            400
          );
        }

        const sanitizedLocation = input.location
          ? sanitizeString(input.location)
          : existingWorkshop.location;

        workshop = await this.workshopRepository.update(request.workshopId, {
          apprenticeId: request.apprenticeId,
          date: input.date,
          time: input.time,
          duration: input.duration ?? existingWorkshop.duration ?? undefined,
          location: sanitizedLocation,
          isVirtual: input.isVirtual ?? existingWorkshop.isVirtual,
          maxParticipants:
            input.maxParticipants ??
            existingWorkshop.maxParticipants ??
            undefined,
        });
      } else {
        const sanitizedLocation = input.location
          ? sanitizeString(input.location)
          : null;

        workshop = await this.workshopRepository.create({
          title: request.title,
          description: request.description,
          date: input.date,
          time: input.time,
          duration: input.duration ?? null,
          location: sanitizedLocation,
          isVirtual: input.isVirtual ?? false,
          maxParticipants: input.maxParticipants ?? null,
          materialsNeeded: null,
          creatorId: mentor.id,
          apprenticeId: request.apprenticeId,
          requestId: request.id,
        });
      }

      await this.workshopRequestRepository.update(requestId, {
        status: "ACCEPTED",
        workshopId: workshop.id,
      });

      // TODO: System of notification will be implemented later
      // TODO: Calendar integration (Calendly) will be implemented later

      return success({ workshopId: workshop.id, requestId: request.id });
    } catch (error) {
      return failure((error as Error).message, 500);
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

      // TODO: System of notification will be implemented later

      return success({ success: true });
    } catch (error) {
      return failure((error as Error).message, 500);
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

      // TODO: System of notification will be implemented later

      return success({ success: true });
    } catch (error) {
      return failure((error as Error).message, 500);
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

      // TODO: System of notification will be implemented later

      return success({ requestId });
    } catch (error) {
      return failure((error as Error).message, 500);
    }
  }
}
