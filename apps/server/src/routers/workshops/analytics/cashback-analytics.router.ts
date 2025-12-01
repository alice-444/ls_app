import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../../../lib/trpc";
import { container } from "../../../lib/di/container";
import { handleRouterResult } from "../../shared/router-helpers";

export const cashbackAnalyticsRouter = router({
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
