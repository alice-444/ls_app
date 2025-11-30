import { z } from "zod";
import { router, protectedProcedure } from "../../lib/trpc";
import { container } from "../../lib/di/container";

export const userRouter = router({
  getTitle: protectedProcedure.query(async ({ ctx }) => {
    const user = await container.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { title: true },
    });

    return { title: user?.title || "Explorer" };
  }),

  checkTitleUpdate: protectedProcedure.query(async ({ ctx }) => {
    const result = await container.userTitleService.updateTitleBasedOnWorkshops(
      ctx.session.user.id
    );

    if (!result.ok) {
      throw new Error(result.error);
    }

    return result.data;
  }),
});
