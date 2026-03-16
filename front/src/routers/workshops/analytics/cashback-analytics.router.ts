import { z } from "zod";
import { router, protectedProcedure, adminProcedure, mentorProcedure } from "../../../lib/trpc";
import { container } from "../../../lib/di/container";
import { handleRouterResult } from "../../shared/router-helpers";

export const cashbackAnalyticsRouter = router({
  getSummary: mentorProcedure
    .input(
      z
        .object({
          from: z.coerce.date().optional(),
          to: z.coerce.date().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const result = await container.workshopCashbackService.getSummary(
        ctx.appUser.id,
        input
      );
      return handleRouterResult(result, {
        operation: "getSummary",
        mentorId: ctx.appUser.id,
      });
    }),

  getHistory: mentorProcedure
    .input(
      z
        .object({
          limit: z.number().int().min(1).max(100).optional(),
          cursor: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const result = await container.workshopCashbackService.getHistory(
        ctx.appUser.id,
        input
      );
      return handleRouterResult(result, {
        operation: "getHistory",
        mentorId: ctx.appUser.id,
      });
    }),

  getProcessingDelays: adminProcedure
    .input(
      z
        .object({
          startDate: z.coerce.date().optional(),
          endDate: z.coerce.date().optional(),
          minDelayMinutes: z.number().int().min(0).optional(),
          maxDelayMinutes: z.number().int().min(0).optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const result =
        await container.workshopCashbackService.getProcessingDelays(input);
      return handleRouterResult(result, {
        operation: "getProcessingDelays",
      });
    }),

  getProcessedCashbacksByDate: adminProcedure
    .input(z.object({ date: z.coerce.date() }))
    .query(async ({ input }) => {
      const result =
        await container.workshopCashbackService.getProcessedCashbacksByDate(
          input.date
        );
      return handleRouterResult(result, {
        operation: "getProcessedCashbacksByDate",
        date: input.date.toISOString(),
      });
    }),

  checkDataIntegrity: adminProcedure.query(async () => {
    const result = await container.workshopCashbackService.checkDataIntegrity();
    return handleRouterResult(result, {
      operation: "checkDataIntegrity",
    });
  }),
});
