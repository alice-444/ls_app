import type { Result } from "../../common";
import { success } from "../../common";
import type { IMentorContactService } from "./mentor-contact.service.interface";
import type { IMentorRepository } from "../repositories/mentor.repository.interface";
import type { INotificationService } from "../../notifications/services/notification.service.interface";
import type { IMessagingService } from "../../messaging/services/messaging.service.interface";
import { logger } from "../../common/logger";
import { handleError, createErrorContext } from "../../common/error-handler";
import { verifyMentorAccess } from "../utils/mentor-helpers";

export class MentorContactService implements IMentorContactService {
  constructor(
    private readonly mentorRepository: IMentorRepository,
    private readonly notificationService?: INotificationService,
    private readonly messagingService?: IMessagingService
  ) {}

  async sendContactRequest(
    apprenticeId: string,
    mentorId: string,
    message: string,
    subject?: string
  ): Promise<Result<{ success: boolean }>> {
    try {
      const mentorCheck = await verifyMentorAccess(this.mentorRepository, mentorId);
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
      return handleError(
        error,
        createErrorContext("sendContactRequest", {
          userId: apprenticeId,
          details: { mentorId, hasSubject: !!subject },
        })
      );
    }
  }
}
