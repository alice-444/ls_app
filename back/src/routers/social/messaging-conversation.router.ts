import { protectedProcedure, router } from "../../lib/trpc";
import { conversationIdSchema } from "@ls-app/shared";
import { container } from "../../lib/di/container";
import { z } from "zod";
import { handleRouterResult } from "../shared/router-helpers";

export const messagingConversationRouter = router({
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    const result = await container.messagingService.getConversations(
      ctx.session.user.id,
    );
    return handleRouterResult(result, {
      operation: "getConversations",
      userId: ctx.session.user.id,
    });
  }),

  getOrCreateConversation: protectedProcedure
    .input(
      z.object({
        otherUserId: z.string(),
        workshopId: z.string().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await container.messagingService.getOrCreateConversation(
        ctx.session.user.id,
        input.otherUserId,
        input.workshopId,
      );
      return handleRouterResult(result, {
        operation: "getOrCreateConversation",
        userId: ctx.session.user.id,
        otherUserId: input.otherUserId,
        workshopId: input.workshopId,
      });
    }),

  getConversationDetails: protectedProcedure
    .input(conversationIdSchema)
    .query(async ({ ctx, input }) => {
      const result = await container.messagingService.getConversationDetails(
        ctx.session.user.id,
        input.conversationId,
      );
      return handleRouterResult(result, {
        operation: "getConversationDetails",
        userId: ctx.session.user.id,
        conversationId: input.conversationId,
      });
    }),

  getUnreadConversationsCount: protectedProcedure.query(async ({ ctx }) => {
    const result = await container.messagingService.getUnreadConversationsCount(
      ctx.session.user.id,
    );
    return handleRouterResult(result, {
      operation: "getUnreadConversationsCount",
      userId: ctx.session.user.id,
    });
  }),

  deleteConversation: protectedProcedure
    .input(conversationIdSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await container.messagingService.deleteConversation(
        ctx.session.user.id,
        input.conversationId,
      );
      return handleRouterResult(result, {
        operation: "deleteConversation",
        userId: ctx.session.user.id,
        conversationId: input.conversationId,
      });
    }),

  pinConversation: protectedProcedure
    .input(conversationIdSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await container.messagingService.pinConversation(
        ctx.session.user.id,
        input.conversationId,
      );
      return handleRouterResult(result, {
        operation: "pinConversation",
        userId: ctx.session.user.id,
        conversationId: input.conversationId,
      });
    }),

  unpinConversation: protectedProcedure
    .input(conversationIdSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await container.messagingService.unpinConversation(
        ctx.session.user.id,
        input.conversationId,
      );
      return handleRouterResult(result, {
        operation: "unpinConversation",
        userId: ctx.session.user.id,
        conversationId: input.conversationId,
      });
    }),
});
