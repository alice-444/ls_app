import { z } from "zod";
import { router, protectedProcedure } from "../lib/trpc";
import { container } from "../lib/di/container";
import { handleRouterResult } from "./router-helpers";

const ReportReasonSchema = z.enum([
  "HARASSMENT",
  "SPAM",
  "INAPPROPRIATE_CONTENT",
  "FAKE_PROFILE",
]);

export const userReportRouter = router({
  createReport: protectedProcedure
    .input(
      z.object({
        reportedUserId: z.string(),
        reason: ReportReasonSchema,
        details: z.string().optional().nullable(),
        messageId: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await container.userReportService.createReport({
        reporterUserId: ctx.session.user.id,
        reportedUserId: input.reportedUserId,
        reason: input.reason,
        details: input.details || null,
        messageId: input.messageId || null,
      });
      return handleRouterResult(result, {
        operation: "createReport",
        userId: ctx.session.user.id,
        reportedUserId: input.reportedUserId,
      });
    }),

  getMyReports: protectedProcedure.query(async ({ ctx }) => {
    const result = await container.userReportService.getReportsByReporter(
      ctx.session.user.id
    );
    return handleRouterResult(result, {
      operation: "getMyReports",
      userId: ctx.session.user.id,
    });
  }),
});
