import { protectedProcedure, router } from "../../lib/trpc-server";
import { container } from "../../lib/di/container";
import { z } from "zod";
import { handleRouterResult } from "../shared/router-helpers";
import { notificationIdSchema } from "@ls-app/shared";

export const notificationRouter = router({
  getNotifications: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).optional().default(50),
          offset: z.number().min(0).max(10000).optional().default(0),
        })
        .optional()
        .default({ limit: 50, offset: 0 }),
    )
    .query(async ({ ctx, input }) => {
      const result = await container.notificationService.getNotifications(
        ctx.session.user.id,
        input.limit,
        input.offset,
      );
      return handleRouterResult(result, {
        operation: "getNotifications",
        userId: ctx.session.user.id,
        limit: input.limit,
        offset: input.offset,
      });
    }),

  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const result = await container.notificationService.getUnreadCount(
      ctx.session.user.id,
    );
    return handleRouterResult(result, {
      operation: "getUnreadCount",
      userId: ctx.session.user.id,
    });
  }),

  getRecentNotifications: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(10).optional().default(5),
        })
        .optional()
        .default({ limit: 5 }),
    )
    .query(async ({ ctx, input }) => {
      const result = await container.notificationService.getRecentNotifications(
        ctx.session.user.id,
        input.limit,
      );
      return handleRouterResult(result, {
        operation: "getRecentNotifications",
        userId: ctx.session.user.id,
        limit: input.limit,
      });
    }),

  markAsRead: protectedProcedure
    .input(notificationIdSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await container.notificationService.markAsRead(
        input.notificationId,
        ctx.session.user.id,
      );
      return handleRouterResult(result, {
        operation: "markAsRead",
        userId: ctx.session.user.id,
        notificationId: input.notificationId,
      });
    }),

  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    const result = await container.notificationService.markAllAsRead(
      ctx.session.user.id,
    );
    return handleRouterResult(result, {
      operation: "markAllAsRead",
      userId: ctx.session.user.id,
    });
  }),

  deleteNotification: protectedProcedure
    .input(notificationIdSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await container.notificationService.deleteNotification(
        input.notificationId,
        ctx.session.user.id,
      );
      return handleRouterResult(result, {
        operation: "deleteNotification",
        userId: ctx.session.user.id,
        notificationId: input.notificationId,
      });
    }),
});
