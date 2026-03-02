import { protectedProcedure, publicProcedure, router } from "../lib/trpc";

// Workshops
import { workshopRouter } from "./workshops/workshop.router";
import { workshopFeedbackRouter } from "./workshops/workshop-feedback.router";
import { cashbackAnalyticsRouter } from "./workshops/analytics/cashback-analytics.router";

// Users
import { userRouter } from "./users/user.router";
import { apprenticeRouter } from "./users/apprentice.router";
import { userBlockRouter } from "./users/moderation/user-block.router";
import { userReportRouter } from "./users/moderation/user-report.router";
import { accountSettingsRouter } from "./users/account-settings.router";

// Mentors
import { mentorRouter } from "./mentors/mentor.router";

// Social
import { connectionRouter } from "./social/connection.router";
import { messagingRouter } from "./social/messaging.router";
import { notificationRouter } from "./social/notification.router";

// Credits
import { creditsRouter } from "./credits/credits.router";

// Admin
import { adminRouter } from "./admin/admin.router";

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
  user: userRouter,
  cashbackAnalytics: cashbackAnalyticsRouter,
  accountSettings: accountSettingsRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
