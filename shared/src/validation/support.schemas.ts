import { z } from "zod";

export const supportRequestSchema = z.object({
  email: z.string().email("L'adresse email est invalide."),
  subject: z
    .string()
    .min(1, "Le sujet est requis.")
    .max(200, "Le sujet ne doit pas dépasser 200 caractères."),
  description: z
    .string()
    .min(10, "La description doit contenir au moins 10 caractères.")
    .max(5000, "La description ne doit pas dépasser 5000 caractères."),
  problemType: z.string().min(1, "Le type de problème est requis."),
});

export type SupportRequestInput = z.infer<typeof supportRequestSchema>;

export const supportMessageSchema = z.object({
  requestId: z.string(),
  content: z.string().min(1, "Le message ne peut pas être vide"),
});

export const SUPPORT_ATTACHMENT_CONFIG = {
  maxSize: 10 * 1024 * 1024, // 10MB
  maxCount: 5,
  allowedMimeTypes: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ] as const,
};
