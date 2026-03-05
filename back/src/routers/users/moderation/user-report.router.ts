import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../../../lib/trpc";
import { container } from "../../../lib/di/container";
import { handleRouterResult } from "../../shared/router-helpers";


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

  getAdminReportQueue: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50).optional(),
        offset: z.number().min(0).default(0).optional(),
        status: z.enum(["PENDING", "REVIEWED", "RESOLVED", "DISMISSED"]).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await container.userReportService.getAdminReportQueue(input);
    }),

  reviewReport: adminProcedure
    .input(
      z.object({
        reportId: z.string(),
        status: z.enum(["REVIEWED", "RESOLVED", "DISMISSED"]),
        adminNotes: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await container.userReportService.reviewReport(
        input.reportId,
        input.status,
        ctx.session.user.id,
        input.adminNotes ?? undefined
      );
    }),
});
