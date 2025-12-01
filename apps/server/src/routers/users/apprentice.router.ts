import { protectedProcedure, router } from "../../lib/trpc";
import { container } from "../../lib/di/container";
import { z } from "zod";

export const apprenticeRouter = router({
  saveIdentityCard: protectedProcedure
    .input(
      z.object({
        displayName: z.string().min(1).max(50),
        studyDomain: z.string().min(1).max(50),
        studyProgram: z.string().min(1).max(50),
        photoUrl: z.string().url().nullable().optional(),
        iceBreakerTags: z
          .array(z.string().max(30))
          .max(5)
          .optional()
          .default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await container.apprenticeProfileService.saveIdentityCard(
        ctx.session.user.id,
        input
      );
      if (!result.ok) {
        throw new Error(result.error);
      }
      return result.data;
    }),

  getIdentityCard: protectedProcedure.query(async ({ ctx }) => {
    const result = await container.apprenticeProfileService.getIdentityCard(
      ctx.session.user.id
    );
    if (!result.ok) {
      throw new Error(result.error);
    }
    return result.data;
  }),

  getMiniProfileForMentor: protectedProcedure
    .input(z.object({ apprenticeUserId: z.string() }))
    .query(async ({ ctx, input }) => {
      const result =
        await container.apprenticeProfileService.getMiniProfileForMentor(
          ctx.session.user.id,
          input.apprenticeUserId
        );
      if (!result.ok) {
        throw new Error(result.error);
      }
      return result.data;
    }),

  getApprenticeProfileForViewer: protectedProcedure
    .input(z.object({ apprenticeUserId: z.string() }))
    .query(async ({ ctx, input }) => {
      const result =
        await container.apprenticeProfileService.getApprenticeProfileForViewer(
          ctx.session.user.id,
          input.apprenticeUserId
        );
      if (!result.ok) {
        throw new Error(result.error);
      }
      return result.data;
    }),
});
