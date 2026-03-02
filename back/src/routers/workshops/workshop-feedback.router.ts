import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../../lib/trpc";
import { container } from "../../lib/di/container";
import { handleRouterResult } from "../shared/router-helpers";

export const workshopFeedbackRouter = router({
  canSubmitFeedback: protectedProcedure
    .input(z.object({ workshopId: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await container.workshopFeedbackService.canSubmitFeedback(
        ctx.session.user.id,
        input.workshopId
      );
      return handleRouterResult(result, {
        operation: "canSubmitFeedback",
        userId: ctx.session.user.id,
        resourceId: input.workshopId,
      });
    }),

  getEligibleWorkshopsForFeedback: protectedProcedure.query(async ({ ctx }) => {
    const result =
      await container.workshopFeedbackService.getEligibleWorkshopsForFeedback(
        ctx.session.user.id
      );
    return handleRouterResult(result, {
      operation: "getEligibleWorkshopsForFeedback",
      userId: ctx.session.user.id,
    });
  }),

  submitFeedback: protectedProcedure
    .input(
      z.object({
        workshopId: z.string(),
        rating: z.number().min(1).max(5),
        comment: z.string().max(1000).optional().nullable(),
        isAnonymous: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await container.workshopFeedbackService.submitFeedback(
        ctx.session.user.id,
        {
          workshopId: input.workshopId,
          rating: input.rating,
          comment: input.comment ?? null,
          isAnonymous: input.isAnonymous,
        }
      );
      return handleRouterResult(result, {
        operation: "submitFeedback",
        userId: ctx.session.user.id,
        resourceId: input.workshopId,
      });
    }),

  getFeedbackByWorkshop: protectedProcedure
    .input(
      z.object({
        workshopId: z.string(),
        limit: z.number().min(1).max(100).default(50).optional(),
        offset: z.number().min(0).default(0).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const result =
        await container.workshopFeedbackService.getFeedbackByWorkshop(
          input.workshopId,
          {
            limit: input.limit,
            offset: input.offset,
          }
        );
      return handleRouterResult(result, {
        operation: "getFeedbackByWorkshop",
        userId: ctx.session.user.id,
        resourceId: input.workshopId,
      });
    }),

  reportFeedback: protectedProcedure
    .input(
      z.object({
        feedbackId: z.string(),
        reason: z
          .string()
          .min(10, "La raison doit contenir au moins 10 caractères")
          .max(500, "La raison ne peut pas dépasser 500 caractères"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await container.workshopFeedbackService.reportFeedback(
        ctx.session.user.id,
        input.feedbackId,
        input.reason
      );
      return handleRouterResult(result, {
        operation: "reportFeedback",
        userId: ctx.session.user.id,
        resourceId: input.feedbackId,
      });
    }),

  getModerationQueue: adminProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(50).optional(),
          offset: z.number().min(0).default(0).optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const result = await container.workshopFeedbackService.getModerationQueue(
        {
          limit: input?.limit,
          offset: input?.offset,
        }
      );
      return handleRouterResult(result, {
        operation: "getModerationQueue",
        userId: ctx.session.user.id,
      });
    }),

  approveFeedback: adminProcedure
    .input(z.object({ feedbackId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = await container.workshopFeedbackService.approveFeedback(
        input.feedbackId
      );
      return handleRouterResult(result, {
        operation: "approveFeedback",
        userId: ctx.session.user.id,
        resourceId: input.feedbackId,
      });
    }),

  deleteFeedback: adminProcedure
    .input(z.object({ feedbackId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = await container.workshopFeedbackService.deleteFeedback(
        input.feedbackId
      );
      return handleRouterResult(result, {
        operation: "deleteFeedback",
        userId: ctx.session.user.id,
        resourceId: input.feedbackId,
      });
    }),

  warnUser: adminProcedure
    .input(z.object({ feedbackId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = await container.workshopFeedbackService.warnUser(
        input.feedbackId
      );
      return handleRouterResult(result, {
        operation: "warnUser",
        userId: ctx.session.user.id,
        resourceId: input.feedbackId,
      });
    }),

  sendTip: protectedProcedure
    .input(
      z.object({
        mentorUserId: z.string(),
        amount: z.number().int().min(1, "Le pourboire minimum est de 1 crédit.").max(100, "Le pourboire maximum est de 100 crédits."),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await container.workshopTippingService.sendTip(
        ctx.session.user.id,
        input.mentorUserId,
        input.amount
      );
      return handleRouterResult(result, {
        operation: "sendTip",
        userId: ctx.session.user.id,
        resourceId: input.mentorUserId,
      });
    }),
});
