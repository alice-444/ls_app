import { z } from "zod";

export const adminAnalyticsSchema = z.object({
  timeRange: z.enum(["7d", "30d", "90d", "all"]).default("30d"),
});

export const updateUserCreditsSchema = z.object({
  userId: z.string().cuid(),
  amount: z.number().min(1),
  reason: z.string().min(3),
  type: z.enum(["ADD", "REMOVE"]),
});

export type AdminAnalyticsInput = z.infer<typeof adminAnalyticsSchema>;
export type UpdateUserCreditsInput = z.infer<typeof updateUserCreditsSchema>;
