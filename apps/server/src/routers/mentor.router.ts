import { publicProcedure, protectedProcedure, router } from "../lib/trpc";
import { container } from "../lib/di/container";
import { z } from "zod";

export const mentorRouter = router({
  getById: publicProcedure
    .input(z.object({ mentorId: z.string() }))
    .query(async ({ input }) => {
      const result = await container.mentorProfileService.getPublishedMentorById(
        input.mentorId
      );
      if (!result.ok) {
        throw new Error(result.error);
      }
      return result.data;
    }),

  sendContactRequest: protectedProcedure
    .input(
      z.object({
        mentorId: z.string(),
        message: z
          .string()
          .min(10, "Le message doit contenir au moins 10 caractères")
          .max(200, "Le message ne peut pas dépasser 200 caractères"),
        subject: z.string().max(100).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await container.mentorContactService.sendContactRequest(
        ctx.session.user.id,
        input.mentorId,
        input.message,
        input.subject
      );
      if (!result.ok) {
        throw new Error(result.error);
      }
      return result.data;
    }),

  getFeedbacks: publicProcedure
    .input(
      z.object({
        mentorId: z.string(),
        workshopId: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const result = await container.mentorFeedbackService.getMentorFeedbacks(
        input.mentorId,
        {
          workshopId: input.workshopId,
        }
      );
      if (!result.ok) {
        throw new Error(result.error);
      }
      return result.data;
    }),

  getPublicWorkshops: protectedProcedure
    .input(z.object({ mentorId: z.string() }))
    .query(async ({ input }) => {
      const result =
        await container.mentorWorkshopService.getMentorPublicWorkshops(
          input.mentorId
        );
      if (!result.ok) {
        throw new Error(result.error);
      }
      return result.data;
    }),
});
