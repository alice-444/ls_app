import { z } from "zod";
import { router, adminProcedure } from "../../lib/trpc";
import { container } from "../../lib/di/container";

export const adminRouter = router({
  getStats: adminProcedure.query(async () => {
    return await container.adminService.getStats();
  }),

  getOnboardingQueue: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50).optional(),
        offset: z.number().min(0).default(0).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return await container.adminService.getOnboardingQueue(input);
    }),

  approveUser: adminProcedure
    .input(z.object({ appUserId: z.string() }))
    .mutation(async ({ input }) => {
      return await container.adminService.approveUser(input.appUserId);
    }),

  rejectUser: adminProcedure
    .input(
      z.object({
        appUserId: z.string(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await container.adminService.rejectUser(input.appUserId, input.reason);
    }),
});
