import { z } from "zod";
import { router, publicProcedure } from "../../lib/trpc";
import { container } from "../../lib/di/container";
import { handleRouterResult } from "../shared/router-helpers";

export const authRouter = router({
  requestMagicLink: publicProcedure
    .input(z.object({ email: z.string().email("L'adresse email est invalide.") }))
    .mutation(async ({ input }) => {
      const result = await container.magicLinkService.requestLink(input.email);
      return handleRouterResult(result);
    }),
});
