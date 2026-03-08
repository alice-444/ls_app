import type { Result } from "../../../common";

export interface IMentorContactService {
  sendContactRequest(
    apprenticeId: string,
    mentorId: string,
    message: string,
    subject?: string
  ): Promise<Result<{ success: boolean }>>;

  contactMentor(
    apprenticeId: string,
    mentorId: string,
    message?: string
  ): Promise<Result<{ conversationId: string }>>;
}

