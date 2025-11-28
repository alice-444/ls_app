import { protectedProcedure, publicProcedure, router } from "../lib/trpc";
import { workshopRouter } from "./workshop.router";
import { workshopFeedbackRouter } from "./workshop-feedback.router";
import { mentorRouter } from "./mentor.router";
import { apprenticeRouter } from "./apprentice.router";
import { connectionRouter } from "./connection.router";
import { messagingRouter } from "./messaging.router";
import { notificationRouter } from "./notification.router";
import { userBlockRouter } from "./user-block.router";
import { userReportRouter } from "./user-report.router";
import { creditsRouter } from "./credits.router";

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
  workshopFeedback: workshopFeedbackRouter,
  mentor: mentorRouter,
  apprentice: apprenticeRouter,
  connection: connectionRouter,
  messaging: messagingRouter,
  notification: notificationRouter,
  userBlock: userBlockRouter,
  userReport: userReportRouter,
  credits: creditsRouter,
});

export type AppRouter = typeof appRouter;
