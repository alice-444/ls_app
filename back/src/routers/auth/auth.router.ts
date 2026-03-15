import { z } from "zod";
import { router, publicProcedure } from "../../lib/trpc";
import { container } from "../../lib/di/container";
import { handleRouterResult } from "../shared/router-helpers";
import { auth } from "../../lib/auth";

export const authRouter = router({
  requestMagicLink: publicProcedure
    .input(z.object({ email: z.string().email("L'adresse email est invalide.") }))
    .mutation(async ({ input, ctx }) => {
      // Prevent email enumeration: only send if user exists
      const appUser = await container.appUserRepository.findByEmail(input.email);
      if (!appUser) {
        return handleRouterResult(
          { ok: true, data: { success: true } },
          { operation: "sendMagicLink", email: input.email }
        );
      }
      const frontendUrl = process.env.CORS_ORIGIN || "https://app.learnsup.fr";
      await auth.api.signInMagicLink({
        body: {
          email: input.email,
          callbackURL: `${frontendUrl}/dashboard`,
          errorCallbackURL: `${frontendUrl}/login?error=magic_link`,
        },
        headers: ctx.req?.headers ?? new Headers(),
      });
      return handleRouterResult(
        { ok: true, data: { success: true } },
        { operation: "sendMagicLink", email: input.email }
      );
    }),
});
