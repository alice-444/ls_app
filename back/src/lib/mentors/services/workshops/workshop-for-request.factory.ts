import type { Result } from "../../../common";
import { failure, success } from "../../../common";
import type { IWorkshopRepository } from "../../../workshops/repositories/workshop.repository.interface";
import type { IWorkshopRequestRepository } from "../../repositories/workshop-request.repository.interface";
import { sanitizeLocation } from "../../../workshops/utils/workshop-helpers";

export interface IWorkshopForRequestFactory {
  createOrUpdateWorkshopForRequest(
    request: any,
    mentorId: string,
    input: WorkshopInputForRequest,
    tx?: any
  ): Promise<Result<{ id: string }>>;
}

export interface WorkshopInputForRequest {
  date: Date;
  time: string;
  duration?: number | null;
  location?: string | null;
  isVirtual?: boolean;
  maxParticipants?: number | null;
}

export class WorkshopForRequestFactory implements IWorkshopForRequestFactory {
  constructor(
    private readonly workshopRepository: IWorkshopRepository,
    private readonly workshopRequestRepository: IWorkshopRequestRepository
  ) {}

  async createOrUpdateWorkshopForRequest(
    request: any,
    mentorId: string,
    input: WorkshopInputForRequest,
    tx?: any
  ): Promise<Result<{ id: string }>> {
    if (request.workshopId) {
      return this.updateExistingWorkshop(request, mentorId, input, tx);
    }
    return this.createNewWorkshop(request, mentorId, input);
  }

  private async updateExistingWorkshop(
    request: any,
    mentorId: string,
    input: WorkshopInputForRequest,
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
          `Cet atelier est complet. Nombre maximum de participants atteint (${acceptedCount + 1}/${maxParticipants}).`,
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

  private async createNewWorkshop(
    request: any,
    mentorId: string,
    input: WorkshopInputForRequest
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
}
