import { protectedProcedure, publicProcedure, router } from "../lib/trpc";
import { workshopRouter } from "./workshop.router";
import { mentorRouter } from "./mentor.router";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
  workshop: workshopRouter,
  mentor: mentorRouter,
});

export type AppRouter = typeof appRouter;
