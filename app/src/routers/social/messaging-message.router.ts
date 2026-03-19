import { protectedProcedure, router } from "../../lib/trpc-server";
import { container } from "../../lib/di/container";
import { z } from "zod";
import { handleRouterResult } from "../shared/router-helpers";
import { conversationIdSchema, messageIdSchema } from "@ls-app/shared";

export const messagingMessageRouter = router({
  getMessages: protectedProcedure
    .input(
      conversationIdSchema.extend({
        limit: z.number().min(1).max(100).optional().default(50),
        offset: z.number().min(0).max(10000).optional().default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const result = await container.messagingService.getMessages(
        ctx.session.user.id,
        input.conversationId,
        input.limit,
        input.offset,
      );
      return handleRouterResult(result, {
        operation: "getMessages",
        userId: ctx.session.user.id,
        conversationId: input.conversationId,
      });
    }),

  sendMessage: protectedProcedure
    .input(
      conversationIdSchema.extend({
        content: z.string().min(1).max(5000),
        replyToMessageId: z.string().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await container.messagingService.sendMessage(
        ctx.session.user.id,
        input.conversationId,
        input.content,
        input.replyToMessageId,
      );
      return handleRouterResult(result, {
        operation: "sendMessage",
        userId: ctx.session.user.id,
        conversationId: input.conversationId,
      });
    }),

  markMessagesAsRead: protectedProcedure
    .input(conversationIdSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await container.messagingService.markMessagesAsRead(
        ctx.session.user.id,
        input.conversationId,
      );
      return handleRouterResult(result, {
        operation: "markMessagesAsRead",
        userId: ctx.session.user.id,
        conversationId: input.conversationId,
      });
    }),

  searchMessages: protectedProcedure
    .input(
      conversationIdSchema.extend({
        query: z.string().min(1),
        limit: z.number().min(1).max(100).optional().default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      const result = await container.messagingService.searchMessages(
        ctx.session.user.id,
        input.conversationId,
        input.query,
        input.limit,
      );
      return handleRouterResult(result, {
        operation: "searchMessages",
        userId: ctx.session.user.id,
        conversationId: input.conversationId,
        query: input.query,
      });
    }),

  updateMessage: protectedProcedure
    .input(
      messageIdSchema.extend({
        content: z.string().min(1).max(5000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await container.messagingService.updateMessage(
        ctx.session.user.id,
        input.messageId,
        input.content,
      );
      return handleRouterResult(result, {
        operation: "updateMessage",
        userId: ctx.session.user.id,
        messageId: input.messageId,
      });
    }),

  deleteMessage: protectedProcedure
    .input(messageIdSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await container.messagingService.deleteMessage(
        ctx.session.user.id,
        input.messageId,
      );
      return handleRouterResult(result, {
        operation: "deleteMessage",
        userId: ctx.session.user.id,
        messageId: input.messageId,
      });
    }),
});
