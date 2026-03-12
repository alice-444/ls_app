import { publicProcedure, protectedProcedure, router } from "../../lib/trpc";
import { container } from "../../lib/di/container";
import { unwrapResult, handleRouterResult } from "../shared/router-helpers";
import { z } from "zod";
import {
  mentorIdSchema,
  requestIdSchema,
  workshopIdSchema,
  calculateEndTime,
} from "@ls-app/shared";

export const mentorRouter = router({
  getDashboardData: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    try {
      const [
        receivedRequestsResult,
        workshopsResult,
        balanceResult,
        connectionsResult,
      ] = await Promise.all([
        container.workshopRequestService.getMentorRequests(userId),
        container.workshopService.getWorkshopsByCreator(userId),
        container.creditService.getBalance(userId),
        container.userConnectionService.getAcceptedConnections(userId),
      ]);

      if (!receivedRequestsResult.ok)
        throw new Error(receivedRequestsResult.error);
      if (!workshopsResult.ok) throw new Error(workshopsResult.error);
      if (!balanceResult.ok) throw new Error(balanceResult.error);
      if (!connectionsResult.ok) throw new Error(connectionsResult.error);

      const workshops = workshopsResult.data;
      const now = new Date();

      // Calculate Past Workshops
      const pastWorkshops = workshops.filter((w: any) => {
        if (w.status === "COMPLETED") return true;
        if (w.status === "PUBLISHED" && w.date && w.time) {
          const endTime = calculateEndTime(w.date, w.time, w.duration || 60);
          return endTime && endTime < now;
        }
        return false;
      });

      // Calculate Mentor Stats
      const completed = workshops.filter((w: any) => {
        if (w.status === "COMPLETED") return true;
        if (w.status === "PUBLISHED" && w.date && w.time) {
          const endTime = calculateEndTime(w.date, w.time, w.duration || 60);
          return endTime != null && endTime < now;
        }
        return false;
      });
      const pending = workshops.filter((w: any) => {
        if (w.status === "PUBLISHED" && w.date && w.time) {
          const endTime = calculateEndTime(w.date, w.time, w.duration || 60);
          return endTime != null && endTime >= now;
        }
        return false;
      });
      const students = new Set(
        workshops.map((w: any) => w.apprenticeId).filter(Boolean),
      );

      const mentorStats = {
        totalWorkshops: workshops.length,
        completedWorkshops: completed.length,
        creditsEarned: completed.length * 20,
        creditsPending: pending.length * 20,
        studentsHelped: students.size,
        hoursTaught:
          Math.round(
            completed.reduce(
              (acc: number, w: any) => acc + (w.duration || 60) / 60,
              0,
            ) * 10,
          ) / 10,
      };

      // Format mentor workshop requests
      const mentorWorkshopRequests = receivedRequestsResult.data.map(
        (req: any) => ({
          ...req,
          apprenticeName:
            req.apprentice?.displayName ||
            req.apprentice?.name ||
            "Un apprenti",
        }),
      );

      return {
        mentorWorkshopRequests,
        mentorWorkshops: workshops,
        pastWorkshops,
        mentorStats,
        creditBalance: balanceResult.data,
        acceptedConnections: connectionsResult.data,
      };
    } catch (error) {
      return handleRouterResult(
        { ok: false, error: (error as Error).message },
        {
          operation: "getDashboardData",
          userId,
        },
      );
    }
  }),

  getPublicProfile: publicProcedure
    .input(mentorIdSchema)
    .query(async ({ ctx, input }) =>
      unwrapResult(
        await container.mentorProfileService.getPublicProfile(
          input.mentorId,
          ctx.session?.user?.id,
        ),
      ),
    ),

  getPublicMentors: publicProcedure
    .input(
      z.object({
        domain: z.string().optional(),
        topic: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ input }) =>
      unwrapResult(
        await container.mentorProfileService.getPublicMentors(input),
      ),
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
      }),
    )
    .mutation(async ({ ctx, input }) =>
      unwrapResult(
        await container.mentorContactService.sendContactRequest(
          ctx.session.user.id,
          input.mentorId,
          input.message,
          input.subject,
        ),
      ),
    ),

  contactMentor: protectedProcedure
    .input(
      z.object({
        mentorId: z.string(),
        message: z
          .string()
          .max(1000, "Le message ne peut pas dépasser 1000 caractères")
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) =>
      unwrapResult(
        await container.mentorContactService.contactMentor(
          ctx.session.user.id,
          input.mentorId,
          input.message,
        ),
      ),
    ),

  getFeedbacks: publicProcedure
    .input(
      z.object({
        mentorId: z.string(),
        workshopId: z.string().optional(),
      }),
    )
    .query(async ({ input }) =>
      unwrapResult(
        await container.mentorFeedbackService.getMentorFeedbacks(
          input.mentorId,
          { workshopId: input.workshopId },
        ),
      ),
    ),

  getPublicWorkshops: protectedProcedure
    .input(mentorIdSchema)
    .query(async ({ input }) =>
      unwrapResult(
        await container.mentorWorkshopService.getMentorPublicWorkshops(
          input.mentorId,
        ),
      ),
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
      }),
    )
    .mutation(async ({ ctx, input }) =>
      unwrapResult(
        await container.workshopRequestService.submitWorkshopRequest(
          ctx.session.user.id,
          input,
        ),
      ),
    ),

  getReceivedRequests: protectedProcedure.query(async ({ ctx }) =>
    unwrapResult(
      await container.workshopRequestService.getMentorRequests(
        ctx.session.user.id,
      ),
    ),
  ),

  getWorkshopRequests: protectedProcedure
    .input(workshopIdSchema)
    .query(async ({ input }) =>
      unwrapResult(
        await container.workshopRequestService.getWorkshopRequests(
          input.workshopId,
        ),
      ),
    ),

  acceptRequest: protectedProcedure
    .input(
      z.object({
        requestId: z.string(),
        date: z.coerce.date(),
        time: z.string().min(1, "L'heure est requise"),
        duration: z.number().int().min(15).max(480).optional().nullable(),
        location: z.string().max(200).optional().nullable(),
        isVirtual: z.boolean().optional().default(false),
        maxParticipants: z.number().int().min(1).optional().nullable(),
      }),
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
          },
        ),
      ),
    ),

  rejectRequest: protectedProcedure
    .input(
      z.object({
        requestId: z.string(),
        reason: z
          .string()
          .max(500, "Le motif ne peut pas dépasser 500 caractères")
          .optional()
          .nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) =>
      unwrapResult(
        await container.workshopRequestService.rejectWorkshopRequest(
          ctx.session.user.id,
          input.requestId,
          input.reason,
        ),
      ),
    ),

  cancelRequest: protectedProcedure
    .input(requestIdSchema)
    .mutation(async ({ ctx, input }) =>
      unwrapResult(
        await container.workshopRequestService.cancelWorkshopRequest(
          ctx.session.user.id,
          input.requestId,
        ),
      ),
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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { requestId, ...updateData } = input;
      return unwrapResult(
        await container.workshopRequestService.updateWorkshopRequest(
          ctx.session.user.id,
          requestId,
          updateData,
        ),
      );
    }),
});
