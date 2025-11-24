import type { AppUserRepository } from "../../users/repositories";
import type { IMessageRepository } from "../repositories/message.repository.interface";
import type { MessageItem } from "./messaging.service.interface";
import type { IMessageEnrichmentService } from "./message-enrichment.service.interface";
import { logger } from "../../common/logger";

export class MessageEnrichmentService implements IMessageEnrichmentService {
  constructor(
    private readonly appUserRepository: AppUserRepository,
    private readonly messageRepository: IMessageRepository
  ) {}

  parseWorkshopReference(content: string): {
    workshopTitle: string;
    workshopDate: Date | null;
  } | null {
    const trimmedContent = content.trim();
    if (!trimmedContent.startsWith("{") || !trimmedContent.endsWith("}")) {
      return null;
    }

    try {
      const parsed = JSON.parse(content);
      if (parsed.type === "workshop_reference") {
        return {
          workshopTitle: parsed.workshopTitle,
          workshopDate: parsed.workshopDate
            ? new Date(parsed.workshopDate)
            : null,
        };
      }
    } catch (error) {
      if (!(error instanceof SyntaxError)) {
        logger.error("Unexpected error parsing message content", error);
      }
    }
    return null;
  }

  formatWorkshopReferenceContent(content: string): string {
    const workshopRef = this.parseWorkshopReference(content);
    if (workshopRef) {
      return `📚 ${workshopRef.workshopTitle}`;
    }
    return content;
  }

  async getSenderDetails(senderId: string): Promise<{
    senderName: string | null;
    senderDisplayName: string | null;
    senderUserId: string;
  }> {
    const senderAppUser = await this.appUserRepository.findByAppUserId(
      senderId
    );

    const senderName = senderAppUser
      ? await this.appUserRepository.findUserNameByUserId(senderAppUser.userId)
      : null;

    const identityCard = senderAppUser
      ? await this.appUserRepository.findIdentityCardByUserId(
          senderAppUser.userId
        )
      : null;

    return {
      senderName,
      senderDisplayName: identityCard?.displayName || null,
      senderUserId: senderAppUser?.userId || senderId,
    };
  }

  async enrichReplyToMessage(
    replyToMessageId: string | null
  ): Promise<MessageItem["replyToMessage"]> {
    if (!replyToMessageId) {
      return null;
    }

    const replyTo = await this.messageRepository.findById(replyToMessageId);
    if (!replyTo) {
      return null;
    }

    const replyToSenderDetails = await this.getSenderDetails(replyTo.senderId);

    const replyToContent = this.formatWorkshopReferenceContent(replyTo.content);

    return {
      messageId: replyTo.id,
      content:
        replyToContent.length > 100
          ? replyToContent.substring(0, 100) + "..."
          : replyToContent,
      senderName: replyToSenderDetails.senderName,
      senderDisplayName: replyToSenderDetails.senderDisplayName,
    };
  }

  async enrichMessageEntity(
    message: import("../repositories/message.repository.interface").MessageEntity
  ): Promise<MessageItem> {
    const senderDetails = await this.getSenderDetails(message.senderId);

    const workshopReference = this.parseWorkshopReference(message.content);

    const replyToMessage = await this.enrichReplyToMessage(
      message.replyToMessageId
    );

    return {
      messageId: message.id,
      senderId: senderDetails.senderUserId,
      senderName: senderDetails.senderName,
      senderDisplayName: senderDetails.senderDisplayName,
      content: message.content,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt || null,
      editCount: message.editCount || 0,
      isRead: message.isRead,
      replyToMessageId: message.replyToMessageId || null,
      replyToMessage,
      workshopReference,
    };
  }
}
