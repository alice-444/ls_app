import type { Result } from "../../common";
import { failure, success } from "../../common";
import type { IMentorContactService } from "./mentor-contact.service.interface";
import type { IMentorRepository } from "../repositories/mentor.repository.interface";

export class MentorContactService implements IMentorContactService {
  constructor(private readonly mentorRepository: IMentorRepository) {}

  private async verifyMentorAccess(mentorId: string): Promise<Result<any>> {
    const mentor = await this.mentorRepository.findMentorById(mentorId);

    if (!mentor) {
      return failure("Mentor introuvable", 404);
    }

    return success({ mentor });
  }

  async sendContactRequest(
    apprenticeId: string,
    mentorId: string,
    message: string,
    subject?: string
  ): Promise<Result<{ success: boolean }>> {
    try {
      const mentorCheck = await this.verifyMentorAccess(mentorId);
      if (!mentorCheck.ok) {
        return mentorCheck;
      }

      const apprentice = await this.mentorRepository.findApprenticeByUserId(
        apprenticeId
      );

      if (!apprentice) {
        return failure("Utilisateur introuvable", 404);
      }

      // TODO: System of realtime messaging will be implemented later
      console.log("Contact request:", {
        from: apprenticeId,
        to: mentorId,
        subject,
        message,
        timestamp: new Date(),
      });

      // TODO: System of notification will be implemented later

      return success({ success: true });
    } catch (error) {
      return failure((error as Error).message, 500);
    }
  }
}

