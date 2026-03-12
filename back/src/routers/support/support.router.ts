import { z } from "zod";
import { router, adminProcedure, protectedProcedure } from "../../lib/trpc";
import { container } from "../../lib/di/container";
import { requestIdSchema } from "@ls-app/shared";

export const supportRouter = router({
  createRequest: protectedProcedure
    .input(
      z.object({
        subject: z.string().min(3),
        description: z.string().min(5),
        problemType: z.enum([
          "TECHNICAL",
          "BILLING",
          "ACCOUNT",
          "FEEDBACK",
          "OTHER",
        ]),
        attachments: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await container.supportRequestService.createSupportRequest({
        userId: ctx.session.user.id,
        email: ctx.session.user.email,
        subject: input.subject,
        description: input.description,
        problemType: input.problemType,
        attachments: input.attachments || [],
      });
    }),

  getAdminSupportQueue: adminProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(50).optional(),
          offset: z.number().min(0).default(0).optional(),
          status: z
            .enum(["PENDING", "IN_PROGRESS", "RESOLVED", "CLOSED"])
            .optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      return await container.supportRequestService.getAdminSupportQueue(input);
    }),

  updateStatus: adminProcedure
    .input(
      requestIdSchema.extend({
        status: z.enum(["PENDING", "IN_PROGRESS", "RESOLVED", "CLOSED"]),
      }),
    )
    .mutation(async ({ input }) => {
      return await container.supportRequestService.updateSupportRequestStatus(
        input.requestId,
        input.status,
      );
    }),

  getRequestById: adminProcedure
    .input(requestIdSchema)
    .query(async ({ input }) => {
      return await container.supportRequestService.getSupportRequestById(
        input.requestId,
      );
    }),
});
