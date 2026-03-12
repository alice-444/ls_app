import { z } from "zod";
export declare const segmentationCriteriaSchema: z.ZodObject<
  {
    role: z.ZodOptional<
      z.ZodEnum<{
        MENTOR: "MENTOR";
        ADMIN: "ADMIN";
        APPRENANT: "APPRENANT";
      }>
    >;
    status: z.ZodOptional<
      z.ZodEnum<{
        PENDING: "PENDING";
        ACTIVE: "ACTIVE";
        SUSPENDED: "SUSPENDED";
      }>
    >;
    isPublished: z.ZodOptional<z.ZodBoolean>;
    hasPublishedWorkshop: z.ZodOptional<z.ZodBoolean>;
    minCredits: z.ZodOptional<z.ZodNumber>;
    maxCredits: z.ZodOptional<z.ZodNumber>;
  },
  z.core.$strip
>;
export declare const bulkNotificationSchema: z.ZodObject<
  {
    criteria: z.ZodObject<
      {
        role: z.ZodOptional<
          z.ZodEnum<{
            MENTOR: "MENTOR";
            ADMIN: "ADMIN";
            APPRENANT: "APPRENANT";
          }>
        >;
        status: z.ZodOptional<
          z.ZodEnum<{
            PENDING: "PENDING";
            ACTIVE: "ACTIVE";
            SUSPENDED: "SUSPENDED";
          }>
        >;
        isPublished: z.ZodOptional<z.ZodBoolean>;
        hasPublishedWorkshop: z.ZodOptional<z.ZodBoolean>;
        minCredits: z.ZodOptional<z.ZodNumber>;
        maxCredits: z.ZodOptional<z.ZodNumber>;
      },
      z.core.$strip
    >;
    title: z.ZodString;
    message: z.ZodString;
    type: z.ZodDefault<z.ZodString>;
    actionUrl: z.ZodOptional<z.ZodString>;
  },
  z.core.$strip
>;
