import { protectedProcedure, router } from "../../lib/trpc";
import { container } from "../../lib/di/container";
import { z } from "zod";
import { handleRouterResult } from "../shared/router-helpers";
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
      return handleRouterResult(result, {
        operation: "addReaction",
        userId: ctx.session.user.id,
        messageId: input.messageId,
        emoji: input.emoji,
      });
    }),

  removeReaction: protectedProcedure
    .input(reactionIdSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await container.messageReactionService.removeReaction(
        ctx.session.user.id,
        input.reactionId,
      );
      return handleRouterResult(result, {
        operation: "removeReaction",
        userId: ctx.session.user.id,
        reactionId: input.reactionId,
      });
    }),

  getMessageReactions: protectedProcedure
    .input(messageIdSchema)
    .query(async ({ ctx, input }) => {
      const result = await container.messageReactionService.getMessageReactions(
        input.messageId,
        ctx.session.user.id,
      );
      return handleRouterResult(result, {
        operation: "getMessageReactions",
        userId: ctx.session.user.id,
        messageId: input.messageId,
      });
    }),

  getMessageReactionsWithUsers: protectedProcedure
    .input(messageIdSchema)
    .query(async ({ ctx, input }) => {
      const result =
        await container.messageReactionService.getMessageReactionsWithUsers(
          input.messageId,
        );
      return handleRouterResult(result, {
        operation: "getMessageReactionsWithUsers",
        userId: ctx.session.user.id,
        messageId: input.messageId,
      });
    }),
});
