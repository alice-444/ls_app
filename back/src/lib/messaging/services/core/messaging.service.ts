import type { Result } from "../../../common";
import type { AppUserRepository } from "../../../users/repositories";
import type { IConversationRepository } from "../../repositories/conversation.repository.interface";
import type { IMessageRepository } from "../../repositories/message.repository.interface";
import type {
  IMessagingService,
  ConversationListItem,
  MessageItem,
} from "./messaging.service.interface";
import type { IWorkshopRepository } from "../../../workshops/repositories/workshop.repository.interface";
import type { IMessageValidationService } from "../validation/message-validation.service.interface";
import type { IMessageEnrichmentService } from "../enrichment/message-enrichment.service.interface";
import type { PrismaClient } from '@/lib/prisma';
import type { IUserBlockService } from "../../../users/services/moderation/user-block.service.interface";
import { ConversationService } from "./conversation.service";
import { MessageOperationsService } from "./message-operations.service";

/**
 * Facade that composes ConversationService and MessageOperationsService
 * while preserving the existing IMessagingService contract.
 */
export class MessagingService implements IMessagingService {
  private readonly conversationService: ConversationService;
  private readonly messageOperationsService: MessageOperationsService;

  constructor(
    appUserRepository: AppUserRepository,
    conversationRepository: IConversationRepository,
    messageRepository: IMessageRepository,
    validationService: IMessageValidationService,
    enrichmentService: IMessageEnrichmentService,
    userBlockService: IUserBlockService,
    workshopRepository?: IWorkshopRepository,
    prismaClient?: PrismaClient
  ) {
    this.conversationService = new ConversationService(
      appUserRepository,
      conversationRepository,
      messageRepository,
      enrichmentService,
      userBlockService,
      workshopRepository,
      prismaClient
    );

    this.messageOperationsService = new MessageOperationsService(
      appUserRepository,
      conversationRepository,
      messageRepository,
      validationService,
      enrichmentService,
      userBlockService
    );
  }

  getConversations(userId: string): Promise<Result<ConversationListItem[]>> {
    return this.conversationService.getConversations(userId);
  }

  getOrCreateConversation(
    userId1: string,
    userId2: string,
    workshopId?: string | null
  ): Promise<Result<{ conversationId: string }>> {
    return this.conversationService.getOrCreateConversation(
      userId1,
      userId2,
      workshopId
    );
  }

  sendMessage(
    userId: string,
    conversationId: string,
    content: string,
    replyToMessageId?: string | null
  ): Promise<Result<{ messageId: string }>> {
    return this.messageOperationsService.sendMessage(
      userId,
      conversationId,
      content,
      replyToMessageId
    );
  }

  getMessages(
    userId: string,
    conversationId: string,
    limit?: number,
    offset?: number
  ): Promise<Result<MessageItem[]>> {
    return this.messageOperationsService.getMessages(
      userId,
      conversationId,
      limit,
      offset
    );
  }

  markMessagesAsRead(
    userId: string,
    conversationId: string
  ): Promise<Result<{ success: boolean; messageIds: string[] }>> {
    return this.messageOperationsService.markMessagesAsRead(
      userId,
      conversationId
    );
  }

  getConversationDetails(
    userId: string,
    conversationId: string
  ): Promise<
    Result<{
      workshopId: string | null;
      workshopTitle: string | null;
      workshopDate: Date | null;
    }>
  > {
    return this.conversationService.getConversationDetails(
      userId,
      conversationId
    );
  }

  getUnreadConversationsCount(
    userId: string
  ): Promise<Result<{ count: number }>> {
    return this.conversationService.getUnreadConversationsCount(userId);
  }

  deleteConversation(
    userId: string,
    conversationId: string
  ): Promise<Result<{ success: boolean }>> {
    return this.conversationService.deleteConversation(userId, conversationId);
  }

  updateMessage(
    userId: string,
    messageId: string,
    content: string
  ): Promise<Result<{ messageId: string; conversationId: string }>> {
    return this.messageOperationsService.updateMessage(
      userId,
      messageId,
      content
    );
  }

  searchMessages(
    userId: string,
    conversationId: string,
    query: string,
    limit?: number
  ): Promise<Result<MessageItem[]>> {
    return this.messageOperationsService.searchMessages(
      userId,
      conversationId,
      query,
      limit
    );
  }

  deleteMessage(
    userId: string,
    messageId: string
  ): Promise<Result<{ success: boolean; conversationId: string }>> {
    return this.messageOperationsService.deleteMessage(userId, messageId);
  }

  pinConversation(
    userId: string,
    conversationId: string
  ): Promise<Result<{ success: boolean }>> {
    return this.conversationService.pinConversation(userId, conversationId);
  }

  unpinConversation(
    userId: string,
    conversationId: string
  ): Promise<Result<{ success: boolean }>> {
    return this.conversationService.unpinConversation(userId, conversationId);
  }
}
