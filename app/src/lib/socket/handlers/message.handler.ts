import type { Server as SocketIOServer, Socket } from "socket.io";
import type { AppUserRepository } from "../../users/repositories";
import type { IConversationRepository } from "../../messaging/repositories/conversation.repository.interface";
import type { IMessageRepository } from "../../messaging/repositories/message.repository.interface";
import type { IMessagingService } from "../../messaging/services/core/messaging.service.interface";
import type { IMessageEnrichmentService } from "../../messaging/services/enrichment/message-enrichment.service.interface";
import type { MessageReactionService } from "../../messaging/services/reactions/message-reaction.service";

interface MessageHandlerDeps {
  messagingService: IMessagingService;
  appUserRepository: AppUserRepository;
  conversationRepository: IConversationRepository;
  messageRepository: IMessageRepository;
  enrichmentService: IMessageEnrichmentService;
  messageReactionService: MessageReactionService;
  messageReactionRepository: {
    findByMessageIdAndUserId(
      messageId: string,
      userId: string
    ): Promise<any[]>;
  };
}

export class SocketMessageHandler {
  constructor(
    private readonly io: SocketIOServer,
    private readonly deps: MessageHandlerDeps
  ) {}

  registerHandlers(socket: Socket, userId: string): void {
    socket.on("join-conversation", (conversationId: string) =>
      this.handleJoinConversation(socket, userId, conversationId)
    );

    socket.on("leave-conversation", (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on(
      "send-message",
      (data: {
        conversationId: string;
        content: string;
        replyToMessageId?: string | null;
      }) => this.handleSendMessage(socket, userId, data)
    );

    socket.on(
      "update-message",
      (data: { messageId: string; content: string }) =>
        this.handleUpdateMessage(socket, userId, data)
    );

    socket.on(
      "mark-messages-read",
      (data: { conversationId: string; messageIds: string[] }) => {
        this.io
          .to(`conversation:${data.conversationId}`)
          .emit("messages-read", {
            conversationId: data.conversationId,
            messageIds: data.messageIds,
          });
      }
    );

    socket.on("delete-message", (data: { messageId: string }) =>
      this.handleDeleteMessage(socket, userId, data)
    );

    socket.on("typing-start", (data: { conversationId: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit("user-typing", {
        userId,
        conversationId: data.conversationId,
      });
    });

    socket.on("typing-stop", (data: { conversationId: string }) => {
      socket
        .to(`conversation:${data.conversationId}`)
        .emit("user-stopped-typing", {
          userId,
          conversationId: data.conversationId,
        });
    });

    socket.on(
      "add-reaction",
      (data: { messageId: string; emoji: string }) =>
        this.handleAddReaction(socket, userId, data)
    );

    socket.on(
      "remove-reaction",
      (data: { messageId: string; emoji: string }) =>
        this.handleRemoveReaction(socket, userId, data)
    );
  }

  private async handleJoinConversation(
    socket: Socket,
    userId: string,
    conversationId: string
  ): Promise<void> {
    try {
      const conversation =
        await this.deps.conversationRepository.findById(conversationId);
      if (!conversation) {
        socket.emit("error", { message: "Conversation not found" });
        return;
      }

      const appUser = await this.deps.appUserRepository.findByUserId(userId);
      if (!appUser) {
        socket.emit("error", { message: "User not found" });
        return;
      }

      if (
        conversation.participant1Id !== appUser.id &&
        conversation.participant2Id !== appUser.id
      ) {
        socket.emit("error", { message: "Not a participant" });
        return;
      }

      socket.join(`conversation:${conversationId}`);
    } catch {
      socket.emit("error", { message: "Failed to join conversation" });
    }
  }

  private async handleSendMessage(
    socket: Socket,
    userId: string,
    data: {
      conversationId: string;
      content: string;
      replyToMessageId?: string | null;
    }
  ): Promise<void> {
    try {
      const result = await this.deps.messagingService.sendMessage(
        userId,
        data.conversationId,
        data.content,
        data.replyToMessageId
      );

      if (!result.ok) {
        socket.emit("error", { message: result.error });
        return;
      }

      const message = await this.deps.messageRepository.findById(
        result.data.messageId
      );
      if (!message) {
        socket.emit("error", { message: "Message not found" });
        return;
      }

      const messageWithDetails =
        await this.deps.enrichmentService.enrichMessageEntity(message);

      const conversation = await this.deps.conversationRepository.findById(
        data.conversationId
      );
      if (!conversation) return;

      const appUser = await this.deps.appUserRepository.findByUserId(userId);
      if (!appUser) return;

      const otherParticipantId =
        conversation.participant1Id === appUser.id
          ? conversation.participant2Id
          : conversation.participant1Id;

      const otherAppUser = await this.deps.appUserRepository.findByAppUserId(
        otherParticipantId
      );
      if (!otherAppUser) return;

      const senderInfo = await this.getSenderInfo(message.senderId);
      const replyToMessage = message.replyToMessageId
        ? await this.buildReplyToMessage(message.replyToMessageId)
        : null;

      this.io
        .to(`conversation:${data.conversationId}`)
        .emit("new-message", {
          messageId: message.id,
          conversationId: message.conversationId,
          senderId: senderInfo.userId,
          senderName: senderInfo.name,
          senderDisplayName: senderInfo.displayName,
          content: message.content,
          createdAt: message.createdAt,
          isRead: message.isRead,
          replyToMessageId: message.replyToMessageId || null,
          replyToMessage,
          workshopReference: messageWithDetails?.workshopReference || null,
        });

      await this.emitConversationUpdates(
        userId,
        data.conversationId,
        otherAppUser.userId
      );
    } catch {
      socket.emit("error", { message: "Failed to send message" });
    }
  }

  private async handleUpdateMessage(
    socket: Socket,
    userId: string,
    data: { messageId: string; content: string }
  ): Promise<void> {
    try {
      const result = await this.deps.messagingService.updateMessage(
        userId,
        data.messageId,
        data.content
      );

      if (!result.ok) {
        socket.emit("error", { message: result.error });
        return;
      }

      const message = await this.deps.messageRepository.findById(
        data.messageId
      );
      if (!message) {
        socket.emit("error", { message: "Message not found" });
        return;
      }

      const senderInfo = await this.getSenderInfo(message.senderId);

      this.io
        .to(`conversation:${result.data.conversationId}`)
        .emit("message-updated", {
          messageId: message.id,
          conversationId: message.conversationId,
          senderId: senderInfo.userId,
          senderName: senderInfo.name,
          senderDisplayName: senderInfo.displayName,
          content: message.content,
          createdAt: message.createdAt,
          updatedAt: message.updatedAt || null,
          editCount: message.editCount || 0,
        });
    } catch (error) {
      socket.emit("error", {
        message: (error as Error).message || "Failed to update message",
      });
    }
  }

  private async handleDeleteMessage(
    socket: Socket,
    userId: string,
    data: { messageId: string }
  ): Promise<void> {
    try {
      const result = await this.deps.messagingService.deleteMessage(
        userId,
        data.messageId
      );

      if (!result.ok) {
        socket.emit("error", { message: result.error });
        return;
      }

      this.io
        .to(`conversation:${result.data.conversationId}`)
        .emit("message-deleted", {
          messageId: data.messageId,
          conversationId: result.data.conversationId,
        });
    } catch (error) {
      socket.emit("error", {
        message: (error as Error).message || "Failed to delete message",
      });
    }
  }

  private async handleAddReaction(
    socket: Socket,
    userId: string,
    data: { messageId: string; emoji: string }
  ): Promise<void> {
    try {
      const result = await this.deps.messageReactionService.addReaction(
        userId,
        data.messageId,
        data.emoji
      );

      if (!result.ok) {
        socket.emit("error", { message: result.error });
        return;
      }

      const message = await this.deps.messageRepository.findById(
        data.messageId
      );
      if (message) {
        this.io
          .to(`conversation:${message.conversationId}`)
          .emit("reaction-added", {
            messageId: data.messageId,
            userId,
            emoji: data.emoji,
          });
      }
    } catch (error) {
      socket.emit("error", {
        message: (error as Error).message || "Failed to add reaction",
      });
    }
  }

  private async handleRemoveReaction(
    socket: Socket,
    userId: string,
    data: { messageId: string; emoji: string }
  ): Promise<void> {
    try {
      const reactions =
        await this.deps.messageReactionRepository.findByMessageIdAndUserId(
          data.messageId,
          userId
        );
      const reaction = reactions.find((r) => r.emoji === data.emoji);

      if (!reaction) {
        socket.emit("error", { message: "Reaction not found" });
        return;
      }

      const result = await this.deps.messageReactionService.removeReaction(
        userId,
        reaction.id
      );

      if (!result.ok) {
        socket.emit("error", { message: result.error });
        return;
      }

      const message = await this.deps.messageRepository.findById(
        data.messageId
      );
      if (message) {
        this.io
          .to(`conversation:${message.conversationId}`)
          .emit("reaction-removed", {
            messageId: data.messageId,
            userId,
            emoji: data.emoji,
          });
      }
    } catch (error) {
      socket.emit("error", {
        message: (error as Error).message || "Failed to remove reaction",
      });
    }
  }

  private async getSenderInfo(
    senderId: string
  ): Promise<{ userId: string; name: string | null; displayName: string | null }> {
    const senderAppUser = await this.deps.appUserRepository.findByAppUserId(
      senderId
    );
    const senderUserId = senderAppUser?.userId || senderId;

    const name = senderAppUser
      ? await this.deps.appUserRepository.findUserNameByUserId(
          senderAppUser.userId
        )
      : null;

    const identityCard = senderAppUser
      ? await this.deps.appUserRepository.findIdentityCardByUserId(
          senderAppUser.userId
        )
      : null;

    return {
      userId: senderUserId,
      name,
      displayName: identityCard?.displayName || null,
    };
  }

  private async buildReplyToMessage(
    replyToMessageId: string
  ): Promise<any | null> {
    const replyTo = await this.deps.messageRepository.findById(
      replyToMessageId
    );
    if (!replyTo) return null;

    const senderInfo = await this.getSenderInfo(replyTo.senderId);
    const replyToContent =
      this.deps.enrichmentService.formatWorkshopReferenceContent(
        replyTo.content
      );

    return {
      messageId: replyTo.id,
      content:
        replyToContent.length > 100
          ? replyToContent.substring(0, 100) + "..."
          : replyToContent,
      senderName: senderInfo.name,
      senderDisplayName: senderInfo.displayName,
    };
  }

  private async emitConversationUpdates(
    senderUserId: string,
    conversationId: string,
    otherUserId: string
  ): Promise<void> {
    const conversationsResult =
      await this.deps.messagingService.getConversations(senderUserId);

    if (!conversationsResult.ok) return;

    const updatedConversation = conversationsResult.data.find(
      (c) => c.conversationId === conversationId
    );
    if (!updatedConversation) return;

    this.io
      .to(`user:${senderUserId}`)
      .emit("conversation-updated", updatedConversation);

    const senderName =
      (await this.deps.appUserRepository.findUserNameByUserId(senderUserId)) ||
      null;
    const senderIdentityCard =
      await this.deps.appUserRepository.findIdentityCardByUserId(senderUserId);

    this.io.to(`user:${otherUserId}`).emit("conversation-updated", {
      ...updatedConversation,
      otherUserId: senderUserId,
      otherUserName: senderName,
      otherUserDisplayName: senderIdentityCard?.displayName || null,
      otherUserPhotoUrl: senderIdentityCard?.photoUrl || null,
    });
  }
}
