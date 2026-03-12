import { z } from "zod";
export declare const studentDealSchema: z.ZodObject<
  {
    title: z.ZodString;
    description: z.ZodString;
    category: z.ZodEnum<{
      FOOD: "FOOD";
      SOFTWARE: "SOFTWARE";
      LEISURE: "LEISURE";
      SERVICES: "SERVICES";
    }>;
    link: z.ZodString;
    promoCode: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    imageUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
  },
  z.core.$strip
>;
export declare const communitySpotSchema: z.ZodObject<
  {
    name: z.ZodString;
    description: z.ZodString;
    address: z.ZodString;
    tags: z.ZodArray<z.ZodString>;
    imageUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
  },
  z.core.$strip
>;
export declare const communityEventSchema: z.ZodObject<
  {
    title: z.ZodString;
    description: z.ZodString;
    date: z.ZodCoercedDate<unknown>;
    location: z.ZodString;
    link: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    imageUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
  },
  z.core.$strip
>;
export declare const communityPollSchema: z.ZodObject<
  {
    question: z.ZodString;
    options: z.ZodArray<
      z.ZodObject<
        {
          label: z.ZodString;
        },
        z.core.$strip
      >
    >;
  },
  z.core.$strip
>;
export declare const bulkReviewProposalsSchema: z.ZodObject<
  {
    type: z.ZodEnum<{
      EVENT: "EVENT";
      DEAL: "DEAL";
      SPOT: "SPOT";
      POLL: "POLL";
    }>;
    ids: z.ZodArray<z.ZodString>;
    action: z.ZodEnum<{
      APPROVE: "APPROVE";
      REJECT: "REJECT";
    }>;
  },
  z.core.$strip
>;
export type BulkReviewProposalsInput = z.infer<
  typeof bulkReviewProposalsSchema
>;
