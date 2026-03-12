import { z } from "zod";
export declare const idSchema: z.ZodObject<
  {
    id: z.ZodString;
  },
  z.core.$strip
>;
export declare const userIdSchema: z.ZodObject<
  {
    userId: z.ZodString;
  },
  z.core.$strip
>;
export declare const mentorIdSchema: z.ZodObject<
  {
    mentorId: z.ZodString;
  },
  z.core.$strip
>;
export declare const workshopIdSchema: z.ZodObject<
  {
    workshopId: z.ZodString;
  },
  z.core.$strip
>;
export declare const conversationIdSchema: z.ZodObject<
  {
    conversationId: z.ZodString;
  },
  z.core.$strip
>;
export declare const messageIdSchema: z.ZodObject<
  {
    messageId: z.ZodString;
  },
  z.core.$strip
>;
export declare const requestIdSchema: z.ZodObject<
  {
    requestId: z.ZodString;
  },
  z.core.$strip
>;
export declare const notificationIdSchema: z.ZodObject<
  {
    notificationId: z.ZodString;
  },
  z.core.$strip
>;
export declare const feedbackIdSchema: z.ZodObject<
  {
    feedbackId: z.ZodString;
  },
  z.core.$strip
>;
export declare const paginationSchema: z.ZodObject<
  {
    limit: z.ZodDefault<z.ZodNumber>;
    cursor: z.ZodOptional<z.ZodNullable<z.ZodString>>;
  },
  z.core.$strip
>;
