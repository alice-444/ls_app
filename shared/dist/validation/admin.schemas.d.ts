import { z } from "zod";
export declare const adminAnalyticsSchema: z.ZodObject<
  {
    timeRange: z.ZodDefault<
      z.ZodEnum<{
        "7d": "7d";
        "30d": "30d";
        "90d": "90d";
        all: "all";
      }>
    >;
  },
  z.core.$strip
>;
export declare const updateUserCreditsSchema: z.ZodObject<
  {
    userId: z.ZodString;
    amount: z.ZodNumber;
    reason: z.ZodString;
    type: z.ZodEnum<{
      ADD: "ADD";
      REMOVE: "REMOVE";
    }>;
  },
  z.core.$strip
>;
export type AdminAnalyticsInput = z.infer<typeof adminAnalyticsSchema>;
export type UpdateUserCreditsInput = z.infer<typeof updateUserCreditsSchema>;
