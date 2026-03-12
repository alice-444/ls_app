import { router, protectedProcedure } from "../../lib/trpc";
import { container } from "../../lib/di/container";
import { handleRouterResult } from "../shared/router-helpers";

export const userRouter = router({
  getTitle: protectedProcedure.query(async ({ ctx }) => {
    const appUser = await container.prisma.user.findUnique({
      where: { userId: ctx.session.user.id },
      select: { title: true },
    });

    return { title: appUser?.title || "Explorer" };
  }),

  checkTitleUpdate: protectedProcedure.query(async ({ ctx }) => {
    const result = await container.userTitleService.updateTitleBasedOnWorkshops(
      ctx.session.user.id,
    );

    return handleRouterResult(result, {
      operation: "checkTitleUpdate",
      userId: ctx.session.user.id,
    });
  }),

  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const appUser = await container.prisma.user.findUnique({
      where: { userId: ctx.session.user.id },
      select: {
        name: true,
        email: true,
        bio: true,
        photoUrl: true,
        emailNotifications: true,
        inAppNotifications: true,
      },
    });

    return {
      name: appUser?.name || null,
      email: appUser?.email || null,
      bio: appUser?.bio || null,
      photoUrl: appUser?.photoUrl || null,
      emailNotifications: appUser?.emailNotifications ?? true,
      inAppNotifications: appUser?.inAppNotifications ?? true,
    };
  }),
});
