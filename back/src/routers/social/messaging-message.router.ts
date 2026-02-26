import { protectedProcedure, router } from "../../lib/trpc";
import { container } from "../../lib/di/container";
import { z } from "zod";
import { logger } from "../../lib/common/logger";
import { getSafeMessagingErrorMessage } from "./messaging-helpers";

export const messagingMessageRouter = router({
  getMessages: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        limit: z.number().min(1).max(100).optional().default(50),
        offset: z.number().min(0).max(10000).optional().default(0),
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
        logger.error("getMessages error", result.error, {
          userId: ctx.session.user.id,
          conversationId: input.conversationId,
        });
        throw new Error(getSafeMessagingErrorMessage(result.error));
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
        logger.error("sendMessage error", result.error, {
          userId: ctx.session.user.id,
          conversationId: input.conversationId,
        });
        throw new Error(getSafeMessagingErrorMessage(result.error));
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
        logger.error("markMessagesAsRead error", result.error, {
          userId: ctx.session.user.id,
          conversationId: input.conversationId,
        });
        throw new Error(getSafeMessagingErrorMessage(result.error));
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
        logger.error("searchMessages error", result.error, {
          userId: ctx.session.user.id,
          conversationId: input.conversationId,
          query: input.query,
        });
        throw new Error(getSafeMessagingErrorMessage(result.error));
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
        logger.error("updateMessage error", result.error, {
          userId: ctx.session.user.id,
          messageId: input.messageId,
        });
        throw new Error(getSafeMessagingErrorMessage(result.error));
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
        logger.error("deleteMessage error", result.error, {
          userId: ctx.session.user.id,
          messageId: input.messageId,
        });
        throw new Error(getSafeMessagingErrorMessage(result.error));
      }
      return result.data;
    }),
});
