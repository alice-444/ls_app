import { adminProcedure, router } from "../../lib/trpc";
import { userIdSchema } from "@ls-app/shared";
import { prisma } from "../../lib/common/prisma";
import { z } from "zod";

export const adminRouter = router({
  getStats: adminProcedure.query(async () => {
    const [reports, moderation, support, onboarding] = await Promise.all([
      prisma.user_report.count({ where: { status: "PENDING" } }),
      prisma.mentor_feedback.count({ where: { status: "UNDER_REVIEW" } }),
      prisma.support_request.count({ where: { status: "PENDING" } }),
      prisma.user.count({ where: { status: "PENDING" } }),
    ]);
    return { reports, moderation, support, onboarding };
  }),

  getOnboardingQueue: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ input }) => {
      const { limit, cursor } = input;
      const items = await prisma.user.findMany({
        take: limit + 1,
        where: { status: "PENDING" },
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "asc" },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items,
        nextCursor,
      };
    }),

  getUsers: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().nullish(),
        status: z.enum(["PENDING", "ACTIVE", "SUSPENDED"]).optional(),
      }),
    )
    .query(async ({ input }) => {
      const { limit, cursor, status } = input;
      const where = status ? { status } : {};
      const items = await prisma.user.findMany({
        take: limit + 1,
        where,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          userId: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          photoUrl: true,
        },
      });

      let nextCursor: string | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items,
        nextCursor,
      };
    }),

  approveUser: adminProcedure
    .input(userIdSchema)
    .mutation(async ({ input }) => {
      return prisma.user.update({
        where: { id: input.userId },
        data: { status: "ACTIVE" },
      });
    }),

  rejectUser: adminProcedure
    .input(z.object({ userId: z.string(), reason: z.string().optional() }))
    .mutation(async ({ input }) => {
      return prisma.user.update({
        where: { id: input.userId },
        data: {
          status: "SUSPENDED",
          deletionReason: input.reason ?? null,
        },
      });
    }),
});
