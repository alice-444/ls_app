import { publicProcedure, protectedProcedure, router } from "../../lib/trpc";
import { container } from "../../lib/di/container";
import { unwrapResult } from "../shared/router-helpers";
import { z } from "zod";

export const mentorRouter = router({
  getById: publicProcedure
    .input(z.object({ mentorId: z.string() }))
    .query(async ({ input }) =>
      unwrapResult(
        await container.mentorProfileService.getPublishedMentorById(
          input.mentorId
        )
      )
    ),

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
    .mutation(async ({ ctx, input }) =>
      unwrapResult(
        await container.mentorContactService.sendContactRequest(
          ctx.session.user.id,
          input.mentorId,
          input.message,
          input.subject
        )
      )
    ),

  getFeedbacks: publicProcedure
    .input(
      z.object({
        mentorId: z.string(),
        workshopId: z.string().optional(),
      })
    )
    .query(async ({ input }) =>
      unwrapResult(
        await container.mentorFeedbackService.getMentorFeedbacks(
          input.mentorId,
          { workshopId: input.workshopId }
        )
      )
    ),

  getPublicWorkshops: protectedProcedure
    .input(z.object({ mentorId: z.string() }))
    .query(async ({ input }) =>
      unwrapResult(
        await container.mentorWorkshopService.getMentorPublicWorkshops(
          input.mentorId
        )
      )
    ),

  submitWorkshopRequest: protectedProcedure
    .input(
      z.object({
        mentorId: z.string(),
        title: z
          .string()
          .min(3, "Le titre doit contenir au moins 3 caractères")
          .max(200, "Le titre ne peut pas dépasser 200 caractères"),
        description: z
          .string()
          .max(1000, "La description ne peut pas dépasser 1000 caractères")
          .optional()
          .nullable(),
        message: z
          .string()
          .max(500, "Le message ne peut pas dépasser 500 caractères")
          .optional()
          .nullable(),
        preferredDate: z.coerce.date().optional().nullable(),
        preferredTime: z.string().optional().nullable(),
        workshopId: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) =>
      unwrapResult(
        await container.workshopRequestService.submitWorkshopRequest(
          ctx.session.user.id,
          input
        )
      )
    ),

  getMyWorkshopRequests: protectedProcedure.query(async ({ ctx }) =>
    unwrapResult(
      await container.workshopRequestService.getApprenticeRequests(
        ctx.session.user.id
      )
    )
  ),

  getMentorWorkshopRequests: protectedProcedure.query(async ({ ctx }) =>
    unwrapResult(
      await container.workshopRequestService.getMentorRequests(
        ctx.session.user.id
      )
    )
  ),

  getWorkshopRequests: protectedProcedure
    .input(z.object({ workshopId: z.string() }))
    .query(async ({ input }) =>
      unwrapResult(
        await container.workshopRequestService.getWorkshopRequests(
          input.workshopId
        )
      )
    ),

  acceptWorkshopRequest: protectedProcedure
    .input(
      z.object({
        requestId: z.string(),
        date: z.coerce.date(),
        time: z.string().min(1, "L'heure est requise"),
        duration: z.number().int().min(15).max(480).optional().nullable(),
        location: z.string().max(200).optional().nullable(),
        isVirtual: z.boolean().optional().default(false),
        maxParticipants: z.number().int().min(1).optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) =>
      unwrapResult(
        await container.workshopRequestService.acceptWorkshopRequest(
          ctx.session.user.id,
          input.requestId,
          {
            date: input.date,
            time: input.time,
            duration: input.duration ?? null,
            location: input.location ?? null,
            isVirtual: input.isVirtual ?? false,
            maxParticipants: input.maxParticipants ?? null,
          }
        )
      )
    ),

  rejectWorkshopRequest: protectedProcedure
    .input(z.object({ requestId: z.string() }))
    .mutation(async ({ ctx, input }) =>
      unwrapResult(
        await container.workshopRequestService.rejectWorkshopRequest(
          ctx.session.user.id,
          input.requestId
        )
      )
    ),

  cancelWorkshopRequest: protectedProcedure
    .input(z.object({ requestId: z.string() }))
    .mutation(async ({ ctx, input }) =>
      unwrapResult(
        await container.workshopRequestService.cancelWorkshopRequest(
          ctx.session.user.id,
          input.requestId
        )
      )
    ),

  updateWorkshopRequest: protectedProcedure
    .input(
      z.object({
        requestId: z.string(),
        title: z
          .string()
          .min(3, "Le titre doit contenir au moins 3 caractères")
          .max(200, "Le titre ne peut pas dépasser 200 caractères")
          .optional(),
        description: z
          .string()
          .max(1000, "La description ne peut pas dépasser 1000 caractères")
          .optional()
          .nullable(),
        message: z
          .string()
          .max(500, "Le message ne peut pas dépasser 500 caractères")
          .optional()
          .nullable(),
        preferredDate: z.coerce.date().optional().nullable(),
        preferredTime: z.string().optional().nullable(),
        mentorId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { requestId, ...updateData } = input;
      return unwrapResult(
        await container.workshopRequestService.updateWorkshopRequest(
          ctx.session.user.id,
          requestId,
          updateData
        )
      );
    }),
});
