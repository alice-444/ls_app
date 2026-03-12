import { protectedProcedure, router } from "../../lib/trpc";
import { container } from "../../lib/di/container";
import { z } from "zod";
import { logger } from "../../lib/common/logger";
import { notificationIdSchema } from "@ls-app/shared";

const getSafeErrorMessage = (error: string): string => {
  if (error.includes("not found") || error.includes("Not found")) {
    return "Ressource introuvable";
  }
  if (
    error.includes("unauthorized") ||
    error.includes("Unauthorized") ||
    error.includes("Not authorized")
  ) {
    return "Vous n'êtes pas autorisé à effectuer cette action";
  }
  if (error.includes("validation") || error.includes("Validation")) {
    return "Les données fournies sont invalides";
  }
  return "Une erreur est survenue. Veuillez réessayer.";
};

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
      if (!result.ok) {
        logger.error("getNotifications error", result.error, {
          userId: ctx.session.user.id,
          limit: input.limit,
          offset: input.offset,
        });
        throw new Error(getSafeErrorMessage(result.error));
      }
      return result.data;
    }),

  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const result = await container.notificationService.getUnreadCount(
      ctx.session.user.id,
    );
    if (!result.ok) {
      logger.error("getUnreadCount error", result.error, {
        userId: ctx.session.user.id,
      });
      throw new Error(getSafeErrorMessage(result.error));
    }
    return result.data;
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
      if (!result.ok) {
        logger.error("getRecentNotifications error", result.error, {
          userId: ctx.session.user.id,
          limit: input.limit,
        });
        throw new Error(getSafeErrorMessage(result.error));
      }
      return result.data;
    }),

  markAsRead: protectedProcedure
    .input(notificationIdSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await container.notificationService.markAsRead(
        input.notificationId,
        ctx.session.user.id,
      );
      if (!result.ok) {
        logger.error("markAsRead error", result.error, {
          userId: ctx.session.user.id,
          notificationId: input.notificationId,
        });
        throw new Error(getSafeErrorMessage(result.error));
      }
      return result.data;
    }),

  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    const result = await container.notificationService.markAllAsRead(
      ctx.session.user.id,
    );
    if (!result.ok) {
      logger.error("markAllAsRead error", result.error, {
        userId: ctx.session.user.id,
      });
      throw new Error(getSafeErrorMessage(result.error));
    }
    return result.data;
  }),

  deleteNotification: protectedProcedure
    .input(notificationIdSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await container.notificationService.deleteNotification(
        input.notificationId,
        ctx.session.user.id,
      );
      if (!result.ok) {
        logger.error("deleteNotification error", result.error, {
          userId: ctx.session.user.id,
          notificationId: input.notificationId,
        });
        throw new Error(getSafeErrorMessage(result.error));
      }
      return result.data;
    }),
});
