import { z } from "zod";
import { router, protectedProcedure } from "../lib/trpc";
import { container } from "../lib/di/container";
import { handleRouterResult } from "./router-helpers";

export const userBlockRouter = router({
  blockUser: protectedProcedure
    .input(
      z.object({
        blockedUserId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await container.userBlockService.blockUser(
        ctx.session.user.id,
        input.blockedUserId
      );
      return handleRouterResult(result, {
        operation: "blockUser",
        userId: ctx.session.user.id,
        blockedUserId: input.blockedUserId,
      });
    }),

  unblockUser: protectedProcedure
    .input(
      z.object({
        blockedUserId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await container.userBlockService.unblockUser(
        ctx.session.user.id,
        input.blockedUserId
      );
      return handleRouterResult(result, {
        operation: "unblockUser",
        userId: ctx.session.user.id,
        blockedUserId: input.blockedUserId,
      });
    }),

  getBlockedUsers: protectedProcedure.query(async ({ ctx }) => {
    const result = await container.userBlockService.getBlockedUsers(
      ctx.session.user.id
    );
    return handleRouterResult(result, {
      operation: "getBlockedUsers",
      userId: ctx.session.user.id,
    });
  }),

  isUserBlocked: protectedProcedure
    .input(
      z.object({
        blockedUserId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const result = await container.userBlockService.isUserBlocked(
        ctx.session.user.id,
        input.blockedUserId
      );
      return handleRouterResult(result, {
        operation: "isUserBlocked",
        userId: ctx.session.user.id,
        blockedUserId: input.blockedUserId,
      });
    }),
});
