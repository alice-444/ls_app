import { protectedProcedure, router } from "../lib/trpc";
import { container } from "../lib/di/container";
import { z } from "zod";

const getSafeErrorMessage = (error: string): string => {
  if (error.includes("not found") || error.includes("Not found")) {
    return "Ressource introuvable";
  }
  if (
    error.includes("unauthorized") ||
    error.includes("Unauthorized") ||
    error.includes("Not a participant")
  ) {
    return "Vous n'êtes pas autorisé à effectuer cette action";
  }
  if (error.includes("validation") || error.includes("Validation")) {
    return "Les données fournies sont invalides";
  }
  if (error.includes("time limit") || error.includes("Time limit")) {
    return "Le délai pour cette action a expiré";
  }
  return "Une erreur est survenue. Veuillez réessayer.";
};

export const messagingRouter = router({
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    const result = await container.messagingService.getConversations(
      ctx.session.user.id
    );
    if (!result.ok) {
      console.error("[Messaging] getConversations error:", result.error);
      throw new Error(getSafeErrorMessage(result.error));
    }
    return result.data;
  }),

  getMessages: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        limit: z.number().min(1).max(100).optional().default(50),
        offset: z.number().min(0).optional().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const result = await container.messagingService.getMessages(
        ctx.session.user.id,
        input.conversationId,
        input.limit,
        input.offset
      );
      if (!result.ok) {
        console.error("[Messaging] Error:", result.error);
        throw new Error(getSafeErrorMessage(result.error));
      }
      return result.data;
    }),

  markMessagesAsRead: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = await container.messagingService.markMessagesAsRead(
        ctx.session.user.id,
        input.conversationId
      );
      if (!result.ok) {
        console.error("[Messaging] Error:", result.error);
        throw new Error(getSafeErrorMessage(result.error));
      }
      return result.data;
    }),

  sendMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        content: z.string().min(1).max(5000),
        replyToMessageId: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await container.messagingService.sendMessage(
        ctx.session.user.id,
        input.conversationId,
        input.content,
        input.replyToMessageId
      );
      if (!result.ok) {
        console.error("[Messaging] Error:", result.error);
        throw new Error(getSafeErrorMessage(result.error));
      }
      return result.data;
    }),

  searchMessages: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        query: z.string().min(1),
        limit: z.number().min(1).max(100).optional().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const result = await container.messagingService.searchMessages(
        ctx.session.user.id,
        input.conversationId,
        input.query,
        input.limit
      );
      if (!result.ok) {
        console.error("[Messaging] Error:", result.error);
        throw new Error(getSafeErrorMessage(result.error));
      }
      return result.data;
    }),

  getOrCreateConversation: protectedProcedure
    .input(
      z.object({
        otherUserId: z.string(),
        workshopId: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await container.messagingService.getOrCreateConversation(
        ctx.session.user.id,
        input.otherUserId,
        input.workshopId
      );
      if (!result.ok) {
        console.error("[Messaging] Error:", result.error);
        throw new Error(getSafeErrorMessage(result.error));
      }
      return result.data;
    }),

  getConversationDetails: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await container.messagingService.getConversationDetails(
        ctx.session.user.id,
        input.conversationId
      );
      if (!result.ok) {
        console.error("[Messaging] Error:", result.error);
        throw new Error(getSafeErrorMessage(result.error));
      }
      return result.data;
    }),

  getUnreadConversationsCount: protectedProcedure.query(async ({ ctx }) => {
    const result = await container.messagingService.getUnreadConversationsCount(
      ctx.session.user.id
    );
    if (!result.ok) {
      throw new Error(result.error);
    }
    return result.data;
  }),

  deleteConversation: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = await container.messagingService.deleteConversation(
        ctx.session.user.id,
        input.conversationId
      );
      if (!result.ok) {
        console.error("[Messaging] Error:", result.error);
        throw new Error(getSafeErrorMessage(result.error));
      }
      return result.data;
    }),

  updateMessage: protectedProcedure
    .input(
      z.object({
        messageId: z.string(),
        content: z.string().min(1).max(5000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await container.messagingService.updateMessage(
        ctx.session.user.id,
        input.messageId,
        input.content
      );
      if (!result.ok) {
        console.error("[Messaging] Error:", result.error);
        throw new Error(getSafeErrorMessage(result.error));
      }
      return result.data;
    }),

  deleteMessage: protectedProcedure
    .input(z.object({ messageId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = await container.messagingService.deleteMessage(
        ctx.session.user.id,
        input.messageId
      );
      if (!result.ok) {
        console.error("[Messaging] Error:", result.error);
        throw new Error(getSafeErrorMessage(result.error));
      }
      return result.data;
    }),

  getUserPresence: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await container.presenceService.getUserPresence(
        input.userId
      );
      if (!result) {
        throw new Error("User not found");
      }
      return result;
    }),

  getMultipleUsersPresence: protectedProcedure
    .input(z.object({ userIds: z.array(z.string()) }))
    .query(async ({ ctx, input }) => {
      const presenceMap =
        await container.presenceService.getMultipleUsersPresence(input.userIds);
      return Object.fromEntries(presenceMap);
    }),

  addReaction: protectedProcedure
    .input(
      z.object({
        messageId: z.string(),
        emoji: z.string().min(1).max(10),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await container.messageReactionService.addReaction(
        ctx.session.user.id,
        input.messageId,
        input.emoji
      );
      if (!result.ok) {
        console.error("[Messaging] Error:", result.error);
        throw new Error(getSafeErrorMessage(result.error));
      }
      return result.data;
    }),

  removeReaction: protectedProcedure
    .input(z.object({ reactionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = await container.messageReactionService.removeReaction(
        ctx.session.user.id,
        input.reactionId
      );
      if (!result.ok) {
        console.error("[Messaging] Error:", result.error);
        throw new Error(getSafeErrorMessage(result.error));
      }
      return result.data;
    }),

  getMessageReactions: protectedProcedure
    .input(z.object({ messageId: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await container.messageReactionService.getMessageReactions(
        input.messageId,
        ctx.session.user.id
      );
      if (!result.ok) {
        console.error("[Messaging] Error:", result.error);
        throw new Error(getSafeErrorMessage(result.error));
      }
      return result.data;
    }),

  getMessageReactionsWithUsers: protectedProcedure
    .input(z.object({ messageId: z.string() }))
    .query(async ({ ctx, input }) => {
      const result =
        await container.messageReactionService.getMessageReactionsWithUsers(
          input.messageId
        );
      if (!result.ok) {
        console.error("[Messaging] Error:", result.error);
        throw new Error(getSafeErrorMessage(result.error));
      }
      return result.data;
    }),
});
