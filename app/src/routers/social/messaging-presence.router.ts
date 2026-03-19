import { protectedProcedure, router } from "../../lib/trpc-server";
import { container } from "../../lib/di/container";
import { z } from "zod";
import { userIdSchema } from "@ls-app/shared";

export const messagingPresenceRouter = router({
  getUserPresence: protectedProcedure
    .input(userIdSchema)
    .query(async ({ ctx, input }) => {
      const result = await container.presenceService.getUserPresence(
        input.userId,
      );

      // If user not found, return a default offline presence instead of throwing
      // This avoids showing tRPC error toasts for missing presence records
      if (!result) {
        return {
          userId: input.userId,
          isOnline: false,
          lastSeen: null,
        };
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
});
