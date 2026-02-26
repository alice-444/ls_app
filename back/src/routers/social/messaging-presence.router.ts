import { protectedProcedure, router } from "../../lib/trpc";
import { container } from "../../lib/di/container";
import { z } from "zod";

export const messagingPresenceRouter = router({
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
});
