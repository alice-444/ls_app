import { z } from "zod";
import { router, adminProcedure } from "../../lib/trpc";
import { container } from "../../lib/di/container";

export const supportRouter = router({
  getAdminSupportQueue: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50).optional(),
        offset: z.number().min(0).default(0).optional(),
        status: z.enum(["PENDING", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await container.supportRequestService.getAdminSupportQueue(input);
    }),

  updateStatus: adminProcedure
    .input(
      z.object({
        requestId: z.string(),
        status: z.enum(["PENDING", "IN_PROGRESS", "RESOLVED", "CLOSED"]),
      })
    )
    .mutation(async ({ input }) => {
      return await container.supportRequestService.updateSupportRequestStatus(
        input.requestId,
        input.status
      );
    }),

  getRequestById: adminProcedure
    .input(z.object({ requestId: z.string() }))
    .query(async ({ input }) => {
      return await container.supportRequestService.getSupportRequestById(input.requestId);
    }),
});
