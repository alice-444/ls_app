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
