import { protectedProcedure, publicProcedure, router } from "../lib/trpc";
import { workshopRouter } from "./workshop.router";
import { mentorRouter } from "./mentor.router";
import { apprenticeRouter } from "./apprentice.router";
import { connectionRouter } from "./connection.router";
import { messagingRouter } from "./messaging.router";
import { notificationRouter } from "./notification.router";

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
  apprentice: apprenticeRouter,
  connection: connectionRouter,
  messaging: messagingRouter,
  notification: notificationRouter,
});

export type AppRouter = typeof appRouter;
