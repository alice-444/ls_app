import type { Result } from "../../../common";
import { failure, success } from "../../../common";
import { handleError, createErrorContext } from "../../../common/error-handler";
import type { IWorkshopRequestRepository } from "../../repositories/workshop-request.repository.interface";
import type { IMentorRepository } from "../../repositories/mentor.repository.interface";

export interface IWorkshopRequestQueryService {
  getApprenticeRequests(userId: string): Promise<Result<Array<any>>>;
  getMentorRequests(userId: string): Promise<Result<Array<any>>>;
  getWorkshopRequests(workshopId: string): Promise<Result<Array<any>>>;
}

export class WorkshopRequestQueryService implements IWorkshopRequestQueryService {
  constructor(
    private readonly workshopRequestRepository: IWorkshopRequestRepository,
    private readonly mentorRepository: IMentorRepository
  ) {}

  async getApprenticeRequests(userId: string): Promise<Result<Array<any>>> {
    try {
      const apprentice =
        await this.mentorRepository.findApprenticeByUserId(userId);
      if (!apprentice) {
        return failure("Utilisateur introuvable", 404);
      }

      const requests =
        await this.workshopRequestRepository.findByApprenticeId(apprentice.id);
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

      const requests =
        await this.workshopRequestRepository.findByMentorId(mentor.id);
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
      const requests =
        await this.workshopRequestRepository.findByWorkshopId(workshopId);
      return success(requests);
    } catch (error) {
      return handleError(
        error,
        createErrorContext("getWorkshopRequests", { resourceId: workshopId })
      );
    }
  }
}
