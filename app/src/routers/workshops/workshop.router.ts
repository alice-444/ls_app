import {
  mentorProcedure,
  publicProcedure,
  protectedProcedure,
  router,
} from "../../lib/trpc-server";
import { container } from "../../lib/di/container";
import {
  createWorkshopBackendSchema,
  updateWorkshopBackendSchema,
  publishWorkshopSchema,
  unpublishWorkshopSchema,
  deleteWorkshopSchema,
  cancelWorkshopSchema,
  workshopIdSchema,
} from "@ls-app/shared";
import { unwrapResult } from "../shared/router-helpers";
import { z } from "zod";
import { workshopAttendanceRouter } from "./workshop-attendance.router";
import { workshopVideoRouter } from "./workshop-video.router";
import { workshopsTotal } from "../../lib/metrics/prometheus";

const workshopCoreRouter = router({
  create: mentorProcedure
    .input(createWorkshopBackendSchema)
    .mutation(async ({ ctx, input }) => {
      const result = unwrapResult(
        await container.workshopService.createWorkshop(
          ctx.session.user.id,
          input,
        ),
      );
      workshopsTotal.inc();
      return result;
    }),

  update: mentorProcedure
    .input(updateWorkshopBackendSchema)
    .mutation(async ({ ctx, input }) =>
      unwrapResult(
        await container.workshopService.updateWorkshop(
          ctx.session.user.id,
          input,
        ),
      ),
    ),

  publish: mentorProcedure
    .input(publishWorkshopSchema)
    .mutation(async ({ ctx, input }) => {
      const result = unwrapResult(
        await container.workshopService.publishWorkshop(
          ctx.session.user.id,
          input,
        ),
      );
      workshopsTotal.labels("published").inc();
      return result;
    }),

  unpublish: mentorProcedure
    .input(unpublishWorkshopSchema)
    .mutation(async ({ ctx, input }) =>
      unwrapResult(
        await container.workshopService.unpublishWorkshop(
          ctx.session.user.id,
          input,
        ),
      ),
    ),

  delete: mentorProcedure
    .input(deleteWorkshopSchema)
    .mutation(async ({ ctx, input }) =>
      unwrapResult(
        await container.workshopService.deleteWorkshop(
          ctx.session.user.id,
          input,
        ),
      ),
    ),

  cancel: mentorProcedure
    .input(cancelWorkshopSchema)
    .mutation(async ({ ctx, input }) => {
      const result = unwrapResult(
        await container.workshopService.cancelWorkshop(
          ctx.session.user.id,
          input,
        ),
      );
      workshopsTotal.labels("cancelled").inc();
      return result;
    }),

  getMyWorkshops: mentorProcedure
    .input(
      z
        .object({
          status: z
            .enum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"])
            .optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) =>
      unwrapResult(
        await container.workshopService.getWorkshopsByCreator(
          ctx.session.user.id,
          input?.status,
        ),
      ),
    ),

  getPublished: publicProcedure.query(async () =>
    unwrapResult(await container.workshopService.getPublishedWorkshops()),
  ),

  getById: publicProcedure
    .input(workshopIdSchema)
    .query(async ({ input }) =>
      unwrapResult(
        await container.workshopService.getWorkshopById(input.workshopId),
      ),
    ),

  getAllTopics: publicProcedure.query(async () =>
    unwrapResult(await container.workshopService.getAllTopics()),
  ),
});

const workshopSchedulingRouter = router({
  getConfirmedWorkshops: protectedProcedure.query(async ({ ctx }) =>
    unwrapResult(
      await container.workshopService.getConfirmedWorkshopsForApprentice(
        ctx.session.user.id,
      ),
    ),
  ),

  updateScheduling: protectedProcedure
    .input(
      z.object({
        workshopId: z.string(),
        date: z.coerce.date().optional().nullable(),
        time: z.string().optional().nullable(),
        duration: z.number().int().min(15).max(480).optional().nullable(),
        location: z.string().max(200).optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { workshopId, ...schedulingData } = input;
      return unwrapResult(
        await container.workshopService.updateWorkshopScheduling(
          ctx.session.user.id,
          workshopId,
          schedulingData,
        ),
      );
    }),

  cancelConfirmed: protectedProcedure
    .input(
      z.object({
        workshopId: z.string(),
        cancellationReason: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) =>
      unwrapResult(
        await container.workshopService.cancelConfirmedWorkshop(
          ctx.session.user.id,
          input.workshopId,
          input.cancellationReason,
        ),
      ),
    ),

  getUpcomingWorkshops: protectedProcedure.query(async ({ ctx }) =>
    unwrapResult(
      await container.workshopService.getUpcomingWorkshopsForApprentice(
        ctx.session.user.id,
      ),
    ),
  ),

  getWorkshopHistory: protectedProcedure.query(async ({ ctx }) =>
    unwrapResult(
      await container.workshopService.getWorkshopHistoryForApprentice(
        ctx.session.user.id,
      ),
    ),
  ),

  getAvailableWorkshops: protectedProcedure.query(async ({ ctx }) =>
    unwrapResult(
      await container.workshopService.getAvailableWorkshopsForApprentice(
        ctx.session.user.id,
      ),
    ),
  ),

  reschedule: mentorProcedure
    .input(
      z.object({
        workshopId: z.string(),
        date: z.coerce.date(),
        time: z
          .string()
          .regex(
            /^([0-1]?\d|2[0-3]):[0-5]\d$/,
            "Format d'heure invalide (HH:MM requis)",
          ),
        duration: z.number().int().min(15).max(480).optional().nullable(),
        location: z.string().max(200).optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { workshopId, ...rescheduleData } = input;
      return unwrapResult(
        await container.workshopService.rescheduleWorkshop(
          ctx.session.user.id,
          workshopId,
          rescheduleData,
        ),
      );
    }),

  cancelAfterReschedule: protectedProcedure
    .input(
      z.object({
        workshopId: z.string(),
        cancellationReason: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) =>
      unwrapResult(
        await container.workshopService.cancelConfirmedWorkshop(
          ctx.session.user.id,
          input.workshopId,
          input.cancellationReason,
        ),
      ),
    ),
});

export const workshopRouter = router({
  ...workshopCoreRouter._def.procedures,
  ...workshopSchedulingRouter._def.procedures,
  ...workshopAttendanceRouter._def.procedures,
  ...workshopVideoRouter._def.procedures,
});
