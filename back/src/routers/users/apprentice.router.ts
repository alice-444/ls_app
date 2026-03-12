import { protectedProcedure, router } from "../../lib/trpc";
import { container } from "../../lib/di/container";
import { unwrapResult, handleRouterResult } from "../shared/router-helpers";
import { z } from "zod";
import { requestIdSchema, apprenticeUserIdSchema } from "@ls-app/shared";

export const apprenticeRouter = router({
  getMyRequests: protectedProcedure.query(async ({ ctx }) =>
    unwrapResult(
      await container.workshopRequestService.getApprenticeRequests(
        ctx.session.user.id,
      ),
    ),
  ),

  getMyWorkshops: protectedProcedure.query(async ({ ctx }) =>
    unwrapResult(
      await container.workshopService.getConfirmedWorkshopsForApprentice(
        ctx.session.user.id,
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

  saveIdentityCard: protectedProcedure
    .input(
      z.object({
        displayName: z.string().min(1).max(50),
        studyDomain: z.string().min(1).max(50),
        studyProgram: z.string().min(1).max(50),
        bio: z.string().max(500).nullable().optional(),
        photoUrl: z.string().url().nullable().optional(),
        iceBreakerTags: z
          .array(z.string().max(30))
          .max(5)
          .optional()
          .default([]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await container.apprenticeProfileService.saveIdentityCard(
        ctx.session.user.id,
        input,
      );
      return handleRouterResult(result, {
        operation: "saveIdentityCard",
        userId: ctx.session.user.id,
      });
    }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        displayName: z.string().min(1).max(50).optional(),
        studyDomain: z.string().min(1).max(50).optional(),
        studyProgram: z.string().min(1).max(50).optional(),
        bio: z.string().max(500).nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await container.apprenticeProfileService.updateProfile(
        ctx.session.user.id,
        input,
      );
      return handleRouterResult(result, {
        operation: "updateProfile",
        userId: ctx.session.user.id,
      });
    }),

  getIdentityCard: protectedProcedure.query(async ({ ctx }) => {
    const result = await container.apprenticeProfileService.getIdentityCard(
      ctx.session.user.id,
    );
    return handleRouterResult(result, {
      operation: "getIdentityCard",
      userId: ctx.session.user.id,
    });
  }),

  getMiniProfileForMentor: protectedProcedure
    .input(apprenticeUserIdSchema)
    .query(async ({ ctx, input }) => {
      const result =
        await container.apprenticeProfileService.getMiniProfileForMentor(
          ctx.session.user.id,
          input.apprenticeUserId,
        );
      return handleRouterResult(result, {
        operation: "getMiniProfileForMentor",
        userId: ctx.session.user.id,
        apprenticeUserId: input.apprenticeUserId,
      });
    }),

  getApprenticeProfileForViewer: protectedProcedure
    .input(apprenticeUserIdSchema)
    .query(async ({ ctx, input }) => {
      const result =
        await container.apprenticeProfileService.getApprenticeProfileForViewer(
          ctx.session.user.id,
          input.apprenticeUserId,
        );
      return handleRouterResult(result, {
        operation: "getApprenticeProfileForViewer",
        userId: ctx.session.user.id,
        apprenticeUserId: input.apprenticeUserId,
      });
    }),
});
