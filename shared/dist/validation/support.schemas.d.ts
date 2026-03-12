import { z } from "zod";
export declare const supportRequestSchema: z.ZodObject<
  {
    email: z.ZodString;
    subject: z.ZodString;
    description: z.ZodString;
    problemType: z.ZodString;
  },
  z.core.$strip
>;
export type SupportRequestInput = z.infer<typeof supportRequestSchema>;
export declare const SUPPORT_ATTACHMENT_CONFIG: {
  maxSize: number;
  maxCount: number;
  allowedMimeTypes: readonly [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
};
