import { protectedProcedure, router } from "../../lib/trpc";
import { container } from "../../lib/di/container";
import { unwrapResult } from "../shared/router-helpers";
import { z } from "zod";

export const workshopVideoRouter = router({
  logVideoLinkClick: protectedProcedure
    .input(z.object({ workshopId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await container.auditLogService.record(
          ctx.session.user.id,
          "VIDEO_LINK_CLICKED",
          {
            workshopId: input.workshopId,
            timestamp: new Date().toISOString(),
          }
        );
        return { success: true };
      } catch (error) {
        console.error("Failed to log video link click:", error);
        return { success: false };
      }
    }),

  getDailyToken: protectedProcedure
    .input(z.object({ workshopId: z.string() }))
    .query(async ({ ctx, input }) => {
      const workshop = unwrapResult(
        await container.workshopService.getWorkshopById(input.workshopId)
      );

      const userId = ctx.session.user.id;
      const isCreator = workshop.creatorId === userId;
      const isApprentice = workshop.apprenticeId === userId;

      if (!isCreator && !isApprentice) {
        throw new Error("You don't have access to this workshop");
      }

      let roomId = workshop.dailyRoomId;
      if (!roomId) {
        const roomResult =
          await container.dailyService.getOrCreateRoomForWorkshop(
            input.workshopId,
            workshop.title
          );
        roomId = unwrapResult(roomResult).roomId;

        await container.workshopRepository.update(input.workshopId, {
          dailyRoomId: roomId,
          dailyRoomLastActivityAt: new Date(),
        });
      } else {
        await container.workshopRepository.update(input.workshopId, {
          dailyRoomLastActivityAt: new Date(),
        });
      }

      const userNameFromDb =
        await container.appUserRepository.findUserNameByUserId(userId);
      const userName = userNameFromDb || ctx.session.user.name || "User";

      return unwrapResult(
        await container.dailyService.generateToken(
          roomId,
          userId,
          userName,
          isCreator
        )
      );
    }),
});
