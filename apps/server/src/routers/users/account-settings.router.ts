import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../../lib/trpc";
import { container } from "../../lib/di/container";

export const accountSettingsRouter = router({
  updateProfile: protectedProcedure
    .input(
      z.object({
        photoUrl: z.string().url().nullable().optional(),
        name: z.string().min(1).max(120).optional(),
        bio: z.string().max(300).nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await container.updateProfileService.updatePublicProfile(
        ctx.session.user.id,
        input
      );

      if (!result.ok) {
        throw new Error(result.error);
      }

      return result.data;
    }),

  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(8),
        confirmPassword: z.string().min(8),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await container.changePasswordService.changePassword(
        ctx.session.user.id,
        input
      );

      if (!result.ok) {
        throw new Error(result.error);
      }

      return result.data;
    }),

  requestEmailChange: protectedProcedure
    .input(
      z.object({
        newEmail: z.string().email(),
        currentPassword: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await container.changeEmailService.requestEmailChange(
        ctx.session.user.id,
        input
      );

      if (!result.ok) {
        throw new Error(result.error);
      }

      return result.data;
    }),

  verifyEmailChange: publicProcedure
    .input(
      z.object({
        token: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const result = await container.changeEmailService.verifyEmailChange(
        input.token
      );

      if (!result.ok) {
        throw new Error(result.error);
      }

      return result.data;
    }),

  requestPasswordReset: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await container.forgotPasswordService.requestPasswordReset(
        input
      );

      if (!result.ok) {
        throw new Error(result.error);
      }

      return result.data;
    }),

  resetPassword: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        otp: z.string().min(1),
        newPassword: z.string().min(8),
        confirmPassword: z.string().min(8),
      })
    )
    .mutation(async ({ input }) => {
      const result = await container.forgotPasswordService.resetPassword(input);

      if (!result.ok) {
        throw new Error(result.error);
      }

      return result.data;
    }),

  checkCanDeleteAccount: protectedProcedure.query(async ({ ctx }) => {
    const result =
      await container.deleteAccountEnhancedService.checkCanDeleteAccount(
        ctx.session.user.id
      );

    if (!result.ok) {
      throw new Error(result.error);
    }

    return result.data;
  }),

  deleteAccount: protectedProcedure
    .input(
      z.object({
        confirmation: z.literal("DELETE"),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const checkResult =
        await container.deleteAccountEnhancedService.checkCanDeleteAccount(
          ctx.session.user.id
        );

      if (!checkResult.ok) {
        throw new Error(checkResult.error);
      }

      if (!checkResult.data.canDelete) {
        throw new Error(checkResult.data.reason || "Cannot delete account");
      }

      const appUser = await container.appUserRepository.findByUserId(
        ctx.session.user.id
      );

      if (!appUser) {
        throw new Error("App user not found");
      }

      const scrubResult = await container.deleteAccountEnhancedService.scrubPII(
        ctx.session.user.id,
        appUser.id
      );

      if (!scrubResult.ok) {
        throw new Error(scrubResult.error);
      }

      return { success: true };
    }),
});
