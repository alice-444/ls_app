import {
  protectedProcedure,
  publicProcedure,
  router,
} from "../lib/trpc-server";
import type { Context } from "../lib/context";

// Workshops
import { workshopRouter } from "./workshops/workshop.router";
import { workshopFeedbackRouter } from "./workshops/workshop-feedback.router";
import { workshopAttendanceRouter } from "./workshops/workshop-attendance.router";
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
import { communityRouter } from "./social/community.router";

// Credits
import { creditsRouter } from "./credits/credits.router";

// Admin
import { adminRouter } from "./admin/admin.router";
import { supportRouter } from "./support/support.router";
import { authRouter } from "./auth/auth.router";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  auth: authRouter,
  privateData: protectedProcedure.query(
    ({
      ctx,
    }: {
      ctx: Context & { session: NonNullable<Context["session"]> };
    }) => {
      return {
        message: "This is private",
        user: ctx.session.user,
      };
    },
  ),
  workshop: workshopRouter,
  workshopFeedback: workshopFeedbackRouter,
  workshopAttendance: workshopAttendanceRouter,
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
  support: supportRouter,
  community: communityRouter,
});

export type AppRouter = typeof appRouter;
