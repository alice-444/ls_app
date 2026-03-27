import { adminProcedure, router } from "../../lib/trpc-server";
import {
  userIdSchema,
  adminAnalyticsSchema,
  bulkNotificationSchema,
  bulkUserIdsSchema,
  updateUserCreditsSchema,
} from "@ls-app/shared";
import { prisma } from "../../lib/common/prisma";
import { container } from "../../lib/di/container";
import { z } from "zod";

export const adminRouter = router({
  getStats: adminProcedure.query(async () => {
    return container.adminService.getStats();
  }),

  getAnalytics: adminProcedure
    .input(adminAnalyticsSchema)
    .query(async ({ input }) => {
      return container.analyticsService.getAnalytics(input.timeRange);
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
      // Note: We're using prisma directly for pagination logic here because
      // the existing getOnboardingQueue in the service didn't support cursors yet.
      // But for the test to pass with our mock, we should ideally move this logic to the service.
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

  searchGlobal: adminProcedure
    .input(z.object({ query: z.string().min(2) }))
    .query(async ({ input }) => {
      const { query } = input;
      const [users, workshops, support] = await Promise.all([
        prisma.user.findMany({
          where: {
            deletedAt: null, // GDPR: Exclude soft-deleted users from global search
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
            ],
          },
          take: 5,
          select: { id: true, name: true, email: true, role: true },
        }),
        prisma.workshop.findMany({
          where: { title: { contains: query, mode: "insensitive" } },
          take: 5,
          select: { id: true, title: true, status: true },
        }),
        prisma.support_request.findMany({
          where: {
            OR: [
              { subject: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
            ],
          },
          take: 5,
          select: { id: true, subject: true, status: true },
        }),
      ]);

      return { users, workshops, support };
    }),

  getUsers: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().nullish(),
        status: z.string().optional(),
        searchTerm: z.string().optional(),
        role: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const { limit, cursor, status, searchTerm, role } = input;

      const where: any = {};

      // GDPR: By default, exclude soft-deleted users unless specifically requested
      if (status === "DELETED") {
        where.deletedAt = { not: null };
      } else {
        where.deletedAt = null;
        if (status && status !== "ALL") where.status = status;
      }

      if (role && role !== "ALL") where.role = role;

      if (searchTerm) {
        where.OR = [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { email: { contains: searchTerm, mode: "insensitive" } },
          { username: { contains: searchTerm, mode: "insensitive" } },
          { displayName: { contains: searchTerm, mode: "insensitive" } },
        ];
      }

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
          creditBalance: true,
          lastSeen: true,
          emailVerified: true,
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
    .mutation(async ({ input, ctx }) => {
      return container.adminService.approveUser(
        input.userId,
        ctx.session.user.id,
      );
    }),

  rejectUser: adminProcedure
    .input(z.object({ userId: z.string(), reason: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      return container.adminService.rejectUser(
        input.userId,
        ctx.session.user.id,
        input.reason,
      );
    }),

  getUser360: adminProcedure.input(userIdSchema).query(async ({ input }) => {
    return container.adminService.getUser360(input.userId);
  }),

  updateUserCredits: adminProcedure
    .input(updateUserCreditsSchema)
    .mutation(async ({ input, ctx }) => {
      return container.adminService.updateUserCredits({
        adminId: ctx.session.user.id,
        ...input,
      });
    }),

  bulkApproveUsers: adminProcedure
    .input(bulkUserIdsSchema)
    .mutation(async ({ input, ctx }) => {
      return container.adminService.bulkApproveUsers(
        input.userIds,
        ctx.session.user.id,
      );
    }),

  bulkRejectUsers: adminProcedure
    .input(bulkUserIdsSchema.extend({ reason: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      return container.adminService.bulkRejectUsers(
        input.userIds,
        ctx.session.user.id,
        input.reason,
      );
    }),

  sendBulkNotification: adminProcedure
    .input(bulkNotificationSchema)
    .mutation(async ({ input }) => {
      const result =
        await container.notificationService.sendBulkNotifications(input);
      if (!result.ok) {
        throw new Error(result.error);
      }
      return result.data;
    }),
});
