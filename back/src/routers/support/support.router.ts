import { z } from "zod";
import { router, adminProcedure, protectedProcedure } from "../../lib/trpc";
import { container } from "../../lib/di/container";
import { requestIdSchema, supportMessageSchema } from "@ls-app/shared";

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

  getMyRequests: protectedProcedure.query(async ({ ctx }) => {
    return await container.supportRequestService.getMyRequests(ctx.session.user.id);
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
    .mutation(async ({ input, ctx }) => {
      return await container.supportRequestService.updateSupportRequestStatus(
        input.requestId,
        input.status,
        ctx.session.user.id,
      );
    }),

  getRequestById: adminProcedure
    .input(requestIdSchema)
    .query(async ({ input }) => {
      return await container.supportRequestService.getSupportRequestById(
        input.requestId,
      );
    }),

  getDetailedRequest: protectedProcedure
    .input(requestIdSchema)
    .query(async ({ input }) => {
      return await container.supportRequestService.getSupportRequestDetailed(
        input.requestId,
      );
    }),

  addMessage: protectedProcedure
    .input(supportMessageSchema)
    .mutation(async ({ input, ctx }) => {
      const user = await container.prisma.user.findUnique({
        where: { id: ctx.session.user.id }
      });
      const isAdmin = user?.role === "ADMIN";

      return await container.supportRequestService.addMessage({
        requestId: input.requestId,
        content: input.content,
        senderId: ctx.session.user.id,
        isAdmin,
      });
    }),
});
