import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../../lib/trpc";
import { container } from "../../lib/di/container";
import { updatePublicProfileSchema } from "@ls-app/shared";
import type { UpdatePublicProfileInput } from "@ls-app/shared";
import { handleRouterResult } from "../shared/router-helpers";

export const accountSettingsRouter = router({
  updateProfile: protectedProcedure
    .input(updatePublicProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await container.updateProfileService.updatePublicProfile(
        ctx.session.user.id,
        input as UpdatePublicProfileInput,
      );

      return handleRouterResult(result, {
        operation: "updateProfile",
        userId: ctx.session.user.id,
      });
    }),

  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(8),
        confirmPassword: z.string().min(8),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await container.changePasswordService.changePassword(
        ctx.session.user.id,
        input,
      );

      return handleRouterResult(result, {
        operation: "changePassword",
        userId: ctx.session.user.id,
      });
    }),

  requestEmailChange: protectedProcedure
    .input(
      z.object({
        newEmail: z.string().email(),
        currentPassword: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await container.changeEmailService.requestEmailChange(
        ctx.session.user.id,
        input,
      );

      return handleRouterResult(result, {
        operation: "requestEmailChange",
        userId: ctx.session.user.id,
      });
    }),

  verifyEmailChange: publicProcedure
    .input(
      z.object({
        token: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const result = await container.changeEmailService.verifyEmailChange(
        input.token,
      );

      return handleRouterResult(result, {
        operation: "verifyEmailChange",
      });
    }),

  requestPasswordReset: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      }),
    )
    .mutation(async ({ input }) => {
      const result =
        await container.forgotPasswordService.requestPasswordReset(input);

      return handleRouterResult(result, {
        operation: "requestPasswordReset",
        email: input.email,
      });
    }),

  resetPassword: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        otp: z.string().min(1),
        newPassword: z.string().min(8),
        confirmPassword: z.string().min(8),
      }),
    )
    .mutation(async ({ input }) => {
      const result = await container.forgotPasswordService.resetPassword(input);

      return handleRouterResult(result, {
        operation: "resetPassword",
        email: input.email,
      });
    }),

  checkCanDeleteAccount: protectedProcedure.query(async ({ ctx }) => {
    const result =
      await container.deleteAccountEnhancedService.checkCanDeleteAccount(
        ctx.session.user.id,
      );

    return handleRouterResult(result, {
      operation: "checkCanDeleteAccount",
      userId: ctx.session.user.id,
    });
  }),

  deleteAccount: protectedProcedure
    .input(
      z.object({
        confirmation: z.literal("DELETE"),
        reason: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result =
        await container.deleteAccountEnhancedService.initiateDeletion(
          ctx.session.user.id,
          input.reason,
        );

      return handleRouterResult(result, {
        operation: "deleteAccount",
        userId: ctx.session.user.id,
      });
    }),
});
