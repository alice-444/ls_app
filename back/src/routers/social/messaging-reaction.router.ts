import { protectedProcedure, router } from "../../lib/trpc";
import { container } from "../../lib/di/container";
import { z } from "zod";
import { logger } from "../../lib/common/logger";
import { getSafeMessagingErrorMessage } from "./messaging-helpers";
import { messageIdSchema, reactionIdSchema } from "@ls-app/shared";

export const messagingReactionRouter = router({
  addReaction: protectedProcedure
    .input(
      messageIdSchema.extend({
        emoji: z.string().min(1).max(10),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await container.messageReactionService.addReaction(
        ctx.session.user.id,
        input.messageId,
        input.emoji,
      );
      if (!result.ok) {
        logger.error("addReaction error", result.error, {
          userId: ctx.session.user.id,
          messageId: input.messageId,
          emoji: input.emoji,
        });
        throw new Error(getSafeMessagingErrorMessage(result.error));
      }
      return result.data;
    }),

  removeReaction: protectedProcedure
    .input(reactionIdSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await container.messageReactionService.removeReaction(
        ctx.session.user.id,
        input.reactionId,
      );
      if (!result.ok) {
        logger.error("removeReaction error", result.error, {
          userId: ctx.session.user.id,
          reactionId: input.reactionId,
        });
        throw new Error(getSafeMessagingErrorMessage(result.error));
      }
      return result.data;
    }),

  getMessageReactions: protectedProcedure
    .input(messageIdSchema)
    .query(async ({ ctx, input }) => {
      const result = await container.messageReactionService.getMessageReactions(
        input.messageId,
        ctx.session.user.id,
      );
      if (!result.ok) {
        logger.error("getMessageReactions error", result.error, {
          userId: ctx.session.user.id,
          messageId: input.messageId,
        });
        throw new Error(getSafeMessagingErrorMessage(result.error));
      }
      return result.data;
    }),

  getMessageReactionsWithUsers: protectedProcedure
    .input(messageIdSchema)
    .query(async ({ ctx, input }) => {
      const result =
        await container.messageReactionService.getMessageReactionsWithUsers(
          input.messageId,
        );
      if (!result.ok) {
        logger.error("getMessageReactionsWithUsers error", result.error, {
          userId: ctx.session.user.id,
          messageId: input.messageId,
        });
        throw new Error(getSafeMessagingErrorMessage(result.error));
      }
      return result.data;
    }),
});
