import type { Result } from "../../../common";
import { success, failure } from "../../../common";
import type { IMentorContactService } from "./mentor-contact.service.interface";
import type { IMentorRepository } from "../../repositories/mentor.repository.interface";
import type { INotificationService } from "../../../notifications/services/notification.service.interface";
import type { IMessagingService } from "../../../messaging/services/core/messaging.service.interface";
import type { IUserBlockService } from "../../../users/services/moderation/user-block.service.interface";
import { logger } from "../../../common/logger";
import { handleError, createErrorContext } from "../../../common/error-handler";
import { verifyMentorAccess } from "../../utils/mentor-helpers";

export class MentorContactService implements IMentorContactService {
  constructor(
    private readonly mentorRepository: IMentorRepository,
    private readonly notificationService?: INotificationService,
    private readonly messagingService?: IMessagingService,
    private readonly userBlockService?: IUserBlockService
  ) {}

  async sendContactRequest(
    apprenticeId: string,
    mentorId: string,
    message: string,
    subject?: string
  ): Promise<Result<{ success: boolean }>> {
    try {
      const mentorCheck = await verifyMentorAccess(
        this.mentorRepository,
        mentorId
      );
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
      if (!mentor?.userId) {
        return failure("Mentor introuvable", 404);
      }

      const mentorBetterAuthId = mentor.userId;

      // Check if blocked
      if (this.userBlockService) {
        const blockCheck = await this.userBlockService.areUsersBlocked(
          apprenticeId,
          mentorBetterAuthId
        );
        if (!blockCheck.ok) return blockCheck;
        if (
          blockCheck.data.user1BlockedUser2 ||
          blockCheck.data.user2BlockedUser1
        ) {
          return failure("Vous ne pouvez pas contacter cet utilisateur", 403);
        }
      }

      const apprenticeName = apprentice.name || "un apprenti";

      logger.info("Contact request sent", {
        from: apprenticeId,
        to: mentorBetterAuthId,
        hasSubject: !!subject,
        hasMessage: !!message,
      });

      if (this.messagingService) {
        const conversationResult =
          await this.messagingService.getOrCreateConversation(
            apprenticeId,
            mentorBetterAuthId
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

        await this.notificationService.createNotification(
          mentorBetterAuthId,
          {
            type: "social",
            title: "Nouvelle demande de contact",
            message: `${apprenticeName} vous a envoyé une demande de contact${
              subject ? ` : "${subject}"` : ""
            }${messagePreview ? `. "${messagePreview}"` : ""}.`,
            actionUrl: `/inbox`,
          },
          apprenticeId
        );
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

  async contactMentor(
    apprenticeId: string,
    mentorId: string,
    message?: string
  ): Promise<Result<{ conversationId: string }>> {
    try {
      const mentor = await this.mentorRepository.findMentorById(mentorId);
      if (!mentor?.userId) {
        return failure("Mentor introuvable", 404);
      }

      const mentorBetterAuthId = mentor.userId;

      // Check if blocked
      if (this.userBlockService) {
        const blockCheck = await this.userBlockService.areUsersBlocked(
          apprenticeId,
          mentorBetterAuthId
        );
        if (!blockCheck.ok) return blockCheck;
        if (
          blockCheck.data.user1BlockedUser2 ||
          blockCheck.data.user2BlockedUser1
        ) {
          return failure("Vous ne pouvez pas contacter cet utilisateur", 403);
        }
      }

      if (!this.messagingService) {
        return failure("Service de messagerie indisponible", 500);
      }

      const conversationResult =
        await this.messagingService.getOrCreateConversation(
          apprenticeId,
          mentorBetterAuthId
        );

      if (!conversationResult.ok) {
        return conversationResult;
      }

      const conversationId = conversationResult.data.conversationId;

      if (message && message.trim()) {
        await this.messagingService.sendMessage(
          apprenticeId,
          conversationId,
          message.trim()
        );
      }

      if (this.notificationService) {
        const apprentice = await this.mentorRepository.findApprenticeByUserId(
          apprenticeId
        );
        const apprenticeName = apprentice?.name || "Un apprenti";

        await this.notificationService.createNotification(
          mentorBetterAuthId,
          {
            type: "social",
            title: "Nouveau message d'un futur apprenti",
            message: `${apprenticeName} vous a contacté.`,
            actionUrl: `/inbox/${conversationId}`,
          },
          apprenticeId
        );
      }

      return success({ conversationId });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("contactMentor", {
          userId: apprenticeId,
          details: { mentorId },
        })
      );
    }
  }
}
