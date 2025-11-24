import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import { auth } from "../auth";
import { container } from "../di/container";

let io: SocketIOServer | null = null;

export function initializeSocketServer(httpServer: HTTPServer): SocketIOServer {
  if (io) {
    return io;
  }

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:3001",
      credentials: true,
      methods: ["GET", "POST"],
    },
    path: "/socket.io",
  });

  io.use(async (socket, next) => {
    try {
      const cookies = socket.handshake.headers.cookie;

      if (!cookies) {
        return next(new Error("Authentication required"));
      }

      const headers = new Map<string, string>();
      headers.set("cookie", cookies);

      const headersObj = {
        get: (name: string) => {
          if (name.toLowerCase() === "cookie") {
            return cookies;
          }
          return socket.handshake.headers[name.toLowerCase()] as
            | string
            | undefined;
        },
        has: (name: string) => {
          if (name.toLowerCase() === "cookie") {
            return !!cookies;
          }
          return name.toLowerCase() in socket.handshake.headers;
        },
      } as Headers;

      const session = await auth.api.getSession({
        headers: headersObj,
      });

      if (!session?.user) {
        return next(new Error("Unauthorized"));
      }

      (socket as any).userId = session.user.id;
      (socket as any).session = session;

      next();
    } catch (error) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = (socket as any).userId;

    if (!userId) {
      socket.disconnect();
      return;
    }

    socket.join(`user:${userId}`);

    await container.presenceService.updateUserPresence(userId, true);

    socket.broadcast.emit("user-online", { userId });

    socket.on("join-conversation", async (conversationId: string) => {
      try {
        const conversation = await container.conversationRepository.findById(
          conversationId
        );

        if (!conversation) {
          socket.emit("error", { message: "Conversation not found" });
          return;
        }

        const appUser = await container.appUserRepository.findByUserId(userId);
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
      } catch (error) {
        socket.emit("error", { message: "Failed to join conversation" });
      }
    });

    socket.on("leave-conversation", (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on(
      "send-message",
      async (data: {
        conversationId: string;
        content: string;
        replyToMessageId?: string | null;
      }) => {
        try {
          const result = await container.messagingService.sendMessage(
            userId,
            data.conversationId,
            data.content,
            data.replyToMessageId
          );

          if (!result.ok) {
            socket.emit("error", { message: result.error });
            return;
          }

          const message = await container.messageRepository.findById(
            result.data.messageId
          );
          if (!message) {
            socket.emit("error", { message: "Message not found" });
            return;
          }

          const { MessageEnrichmentService } = await import(
            "../messaging/services/message-enrichment.service"
          );
          const enrichmentService = new MessageEnrichmentService(
            container.appUserRepository,
            container.messageRepository
          );
          const messageWithDetails =
            await enrichmentService.enrichMessageEntity(message);

          const conversation = await container.conversationRepository.findById(
            data.conversationId
          );
          if (!conversation) {
            return;
          }

          const appUser = await container.appUserRepository.findByUserId(
            userId
          );
          if (!appUser) {
            return;
          }

          const otherParticipantId =
            conversation.participant1Id === appUser.id
              ? conversation.participant2Id
              : conversation.participant1Id;

          const otherAppUser =
            await container.appUserRepository.findByAppUserId(
              otherParticipantId
            );
          if (!otherAppUser) {
            return;
          }

          const senderAppUser =
            await container.appUserRepository.findByAppUserId(message.senderId);
          const senderUserId = senderAppUser?.userId || message.senderId;

          const senderName = senderAppUser
            ? await container.appUserRepository.findUserNameByUserId(
                senderAppUser.userId
              )
            : null;

          const identityCard = senderAppUser
            ? await container.appUserRepository.findIdentityCardByUserId(
                senderAppUser.userId
              )
            : null;

          let replyToMessage = null;
          if (message.replyToMessageId) {
            const replyTo = await container.messageRepository.findById(
              message.replyToMessageId
            );
            if (replyTo) {
              const replyToSenderAppUser =
                await container.appUserRepository.findByAppUserId(
                  replyTo.senderId
                );
              const replyToSenderName = replyToSenderAppUser
                ? await container.appUserRepository.findUserNameByUserId(
                    replyToSenderAppUser.userId
                  )
                : null;
              const replyToIdentityCard = replyToSenderAppUser
                ? await container.appUserRepository.findIdentityCardByUserId(
                    replyToSenderAppUser.userId
                  )
                : null;

              const { MessageEnrichmentService } = await import(
                "../messaging/services/message-enrichment.service"
              );
              const enrichmentService = new MessageEnrichmentService(
                container.appUserRepository,
                container.messageRepository
              );
              const replyToContent =
                enrichmentService.formatWorkshopReferenceContent(
                  replyTo.content
                );

              replyToMessage = {
                messageId: replyTo.id,
                content:
                  replyToContent.length > 100
                    ? replyToContent.substring(0, 100) + "..."
                    : replyToContent,
                senderName: replyToSenderName,
                senderDisplayName: replyToIdentityCard?.displayName || null,
              };
            }
          }

          io!.to(`conversation:${data.conversationId}`).emit("new-message", {
            messageId: message.id,
            conversationId: message.conversationId,
            senderId: senderUserId,
            senderName,
            senderDisplayName: identityCard?.displayName || null,
            content: message.content,
            createdAt: message.createdAt,
            isRead: message.isRead,
            replyToMessageId: message.replyToMessageId || null,
            replyToMessage,
            workshopReference: messageWithDetails?.workshopReference || null,
          });

          const conversationsResult =
            await container.messagingService.getConversations(userId);
          if (conversationsResult.ok) {
            const updatedConversation = conversationsResult.data.find(
              (c) => c.conversationId === data.conversationId
            );
            if (updatedConversation) {
              io!
                .to(`user:${userId}`)
                .emit("conversation-updated", updatedConversation);
              io!
                .to(`user:${otherAppUser.userId}`)
                .emit("conversation-updated", {
                  ...updatedConversation,
                  otherUserId: userId,
                  otherUserName:
                    (await container.appUserRepository.findUserNameByUserId(
                      userId
                    )) || null,
                  otherUserDisplayName:
                    (
                      await container.appUserRepository.findIdentityCardByUserId(
                        userId
                      )
                    )?.displayName || null,
                  otherUserPhotoUrl:
                    (
                      await container.appUserRepository.findIdentityCardByUserId(
                        userId
                      )
                    )?.photoUrl || null,
                });
            }
          }
        } catch (error) {
          socket.emit("error", { message: "Failed to send message" });
        }
      }
    );

    socket.on(
      "update-message",
      async (data: { messageId: string; content: string }) => {
        try {
          const result = await container.messagingService.updateMessage(
            userId,
            data.messageId,
            data.content
          );

          if (!result.ok) {
            socket.emit("error", { message: result.error });
            return;
          }

          const message = await container.messageRepository.findById(
            data.messageId
          );
          if (!message) {
            socket.emit("error", { message: "Message not found" });
            return;
          }

          const conversation = await container.conversationRepository.findById(
            result.data.conversationId
          );
          if (!conversation) {
            return;
          }

          const senderAppUser =
            await container.appUserRepository.findByAppUserId(message.senderId);
          const senderUserId = senderAppUser?.userId || message.senderId;

          const senderName = senderAppUser
            ? await container.appUserRepository.findUserNameByUserId(
                senderAppUser.userId
              )
            : null;

          const identityCard = senderAppUser
            ? await container.appUserRepository.findIdentityCardByUserId(
                senderAppUser.userId
              )
            : null;

          io!
            .to(`conversation:${result.data.conversationId}`)
            .emit("message-updated", {
              messageId: message.id,
              conversationId: message.conversationId,
              senderId: senderUserId,
              senderName,
              senderDisplayName: identityCard?.displayName || null,
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
    );

    socket.on(
      "mark-messages-read",
      async (data: { conversationId: string; messageIds: string[] }) => {
        try {
          io!.to(`conversation:${data.conversationId}`).emit("messages-read", {
            conversationId: data.conversationId,
            messageIds: data.messageIds,
          });
        } catch (error) {
          socket.emit("error", {
            message:
              (error as Error).message || "Failed to mark messages as read",
          });
        }
      }
    );

    socket.on("delete-message", async (data: { messageId: string }) => {
      try {
        const result = await container.messagingService.deleteMessage(
          userId,
          data.messageId
        );

        if (!result.ok) {
          socket.emit("error", { message: result.error });
          return;
        }

        io!
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
    });

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
      async (data: { messageId: string; emoji: string }) => {
        try {
          const result = await container.messageReactionService.addReaction(
            userId,
            data.messageId,
            data.emoji
          );

          if (!result.ok) {
            socket.emit("error", { message: result.error });
            return;
          }

          const message = await container.messageRepository.findById(
            data.messageId
          );
          if (message) {
            io!
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
    );

    socket.on(
      "remove-reaction",
      async (data: { messageId: string; emoji: string }) => {
        try {
          const reactions =
            await container.messageReactionRepository.findByMessageIdAndUserId(
              data.messageId,
              userId
            );
          const reaction = reactions.find((r) => r.emoji === data.emoji);

          if (!reaction) {
            socket.emit("error", { message: "Reaction not found" });
            return;
          }

          const result = await container.messageReactionService.removeReaction(
            userId,
            reaction.id
          );

          if (!result.ok) {
            socket.emit("error", { message: result.error });
            return;
          }

          const message = await container.messageRepository.findById(
            data.messageId
          );
          if (message) {
            io!
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
    );

    socket.on("disconnect", async () => {
      await container.presenceService.updateUserPresence(userId, false);
      socket.broadcast.emit("user-offline", { userId });
    });
  });

  return io;
}

export function getSocketServer(): SocketIOServer | null {
  return io;
}
