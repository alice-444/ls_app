import type { MessageItem } from "../core/messaging.service.interface";

export interface IMessageEnrichmentService {
  parseWorkshopReference(content: string): {
    workshopTitle: string;
    workshopDate: Date | null;
  } | null;

  formatWorkshopReferenceContent(content: string): string;

  getSenderDetails(senderId: string): Promise<{
    senderName: string | null;
    senderDisplayName: string | null;
    senderUserId: string;
  }>;

  enrichReplyToMessage(
    replyToMessageId: string | null
  ): Promise<MessageItem["replyToMessage"]>;

  enrichMessageEntity(
    message: import("../../repositories/message.repository.interface").MessageEntity
  ): Promise<MessageItem>;
}
