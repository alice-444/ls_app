import { z } from "zod";

export const segmentationCriteriaSchema = z.object({
  role: z.enum(["MENTOR", "APPRENANT", "ADMIN"]).optional(),
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED"]).optional(),
  isPublished: z.boolean().optional(),
  hasPublishedWorkshop: z.boolean().optional(),
  minCredits: z.number().optional(),
  maxCredits: z.number().optional(),
});

export const bulkNotificationSchema = z.object({
  criteria: segmentationCriteriaSchema,
  title: z.string().min(1, "Le titre est requis"),
  message: z.string().min(1, "Le message est requis"),
  type: z.string().default("SYSTEM"),
  actionUrl: z.string().optional(),
});
