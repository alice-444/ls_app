import type { Result } from "../../common";
import { failure, success } from "../../common";
import type { IMentorContactService } from "./mentor-contact.service.interface";
import type { IMentorRepository } from "../repositories/mentor.repository.interface";
import type { INotificationService } from "../../notifications/services/notification.service.interface";
import type { IMessagingService } from "../../messaging/services/messaging.service.interface";
import { logger } from "../../common/logger";

export class MentorContactService implements IMentorContactService {
  constructor(
    private readonly mentorRepository: IMentorRepository,
    private readonly notificationService?: INotificationService,
    private readonly messagingService?: IMessagingService
  ) {}

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

      const mentor = await this.mentorRepository.findMentorById(mentorId);
      if (!mentor?.user?.id) {
        return failure("Mentor introuvable", 404);
      }

      const mentorUserId = mentor.user.id;
      const apprenticeName = apprentice.user?.name || "un apprenti";

      logger.info("Contact request sent", {
        from: apprenticeId,
        to: mentorUserId,
        hasSubject: !!subject,
        hasMessage: !!message,
      });

      if (this.messagingService) {
        const conversationResult =
          await this.messagingService.getOrCreateConversation(
            apprenticeId,
            mentorUserId
          );

        if (conversationResult.ok) {
          const messageContent = subject
            ? `**${subject}**\n\n${message}`
            : message;

          await this.messagingService.sendMessage(
            apprenticeId,
            conversationResult.data.conversationId,
            messageContent
          );
        }
      }

      if (this.notificationService) {
        const messagePreview =
          message && message.length > 50
            ? `${message.substring(0, 50)}...`
            : message;

        await this.notificationService.createNotification(mentorUserId, {
          type: "social",
          title: "Nouvelle demande de contact",
          message: `${apprenticeName} vous a envoyé une demande de contact${
            subject ? ` : "${subject}"` : ""
          }${messagePreview ? `. "${messagePreview}"` : ""}.`,
          actionUrl: `/dashboard/messages`,
        });
      }

      return success({ success: true });
    } catch (error) {
      return failure((error as Error).message, 500);
    }
  }
}
