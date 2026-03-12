import { protectedProcedure, router } from "../../lib/trpc";
import { conversationIdSchema } from "@ls-app/shared";
import { container } from "../../lib/di/container";
import { z } from "zod";
import { logger } from "../../lib/common/logger";
import { getSafeMessagingErrorMessage } from "./messaging-helpers";

export const messagingConversationRouter = router({
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    const result = await container.messagingService.getConversations(
      ctx.session.user.id,
    );
    if (!result.ok) {
      logger.error("getConversations error", result.error, {
        userId: ctx.session.user.id,
      });
      throw new Error(getSafeMessagingErrorMessage(result.error));
    }
    return result.data;
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
      if (!result.ok) {
        logger.error("getOrCreateConversation error", result.error, {
          userId: ctx.session.user.id,
          otherUserId: input.otherUserId,
          workshopId: input.workshopId,
        });
        throw new Error(getSafeMessagingErrorMessage(result.error));
      }
      return result.data;
    }),

  getConversationDetails: protectedProcedure
    .input(conversationIdSchema)
    .query(async ({ ctx, input }) => {
      const result = await container.messagingService.getConversationDetails(
        ctx.session.user.id,
        input.conversationId,
      );
      if (!result.ok) {
        logger.error("getConversationDetails error", result.error, {
          userId: ctx.session.user.id,
          conversationId: input.conversationId,
        });
        throw new Error(getSafeMessagingErrorMessage(result.error));
      }
      return result.data;
    }),

  getUnreadConversationsCount: protectedProcedure.query(async ({ ctx }) => {
    const result = await container.messagingService.getUnreadConversationsCount(
      ctx.session.user.id,
    );
    if (!result.ok) {
      throw new Error(result.error);
    }
    return result.data;
  }),

  deleteConversation: protectedProcedure
    .input(conversationIdSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await container.messagingService.deleteConversation(
        ctx.session.user.id,
        input.conversationId,
      );
      if (!result.ok) {
        logger.error("deleteConversation error", result.error, {
          userId: ctx.session.user.id,
          conversationId: input.conversationId,
        });
        throw new Error(getSafeMessagingErrorMessage(result.error));
      }
      return result.data;
    }),

  pinConversation: protectedProcedure
    .input(conversationIdSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await container.messagingService.pinConversation(
        ctx.session.user.id,
        input.conversationId,
      );
      if (!result.ok) {
        logger.error("pinConversation error", result.error, {
          userId: ctx.session.user.id,
          conversationId: input.conversationId,
        });
        throw new Error(getSafeMessagingErrorMessage(result.error));
      }
      return result.data;
    }),

  unpinConversation: protectedProcedure
    .input(conversationIdSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await container.messagingService.unpinConversation(
        ctx.session.user.id,
        input.conversationId,
      );
      if (!result.ok) {
        logger.error("unpinConversation error", result.error, {
          userId: ctx.session.user.id,
          conversationId: input.conversationId,
        });
        throw new Error(getSafeMessagingErrorMessage(result.error));
      }
      return result.data;
    }),
});
