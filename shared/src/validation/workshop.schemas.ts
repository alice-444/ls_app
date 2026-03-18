import { z } from "zod";
import {
  WORKSHOP_VALIDATION,
  WORKSHOP_ERROR_MESSAGES,
} from "./workshop.constants";
import { isMinimumTomorrow, isMinimumToday } from "./date.validators";

// Schémas de base pour chaque champ
export const workshopFieldSchemas = {
  title: z
    .string()
    .trim()
    .min(WORKSHOP_VALIDATION.title.min, WORKSHOP_ERROR_MESSAGES.title.min)
    .max(WORKSHOP_VALIDATION.title.max, WORKSHOP_ERROR_MESSAGES.title.max),

  description: z
    .string()
    .trim()
    .max(
      WORKSHOP_VALIDATION.description.max,
      WORKSHOP_ERROR_MESSAGES.description.max,
    ),

  date: z.coerce
    .date()
    .refine(isMinimumToday, "La date ne peut pas être dans le passé"),

  time: z
    .string()
    .trim()
    .regex(
      WORKSHOP_VALIDATION.time.regex,
      WORKSHOP_ERROR_MESSAGES.time.invalidFormat,
    ),

  duration: z
    .number()
    .int(WORKSHOP_ERROR_MESSAGES.duration.integer)
    .min(WORKSHOP_VALIDATION.duration.min, WORKSHOP_ERROR_MESSAGES.duration.min)
    .max(
      WORKSHOP_VALIDATION.duration.max,
      WORKSHOP_ERROR_MESSAGES.duration.max,
    ),

  location: z
    .string()
    .trim()
    .max(
      WORKSHOP_VALIDATION.location.max,
      WORKSHOP_ERROR_MESSAGES.location.max,
    ),

  isVirtual: z.boolean(),

  maxParticipants: z
    .number()
    .int(WORKSHOP_ERROR_MESSAGES.maxParticipants.integer)
    .min(
      WORKSHOP_VALIDATION.maxParticipants.min,
      WORKSHOP_ERROR_MESSAGES.maxParticipants.min,
    )
    .max(
      WORKSHOP_VALIDATION.maxParticipants.max,
      WORKSHOP_ERROR_MESSAGES.maxParticipants.max,
    ),

  materialsNeeded: z
    .string()
    .trim()
    .max(
      WORKSHOP_VALIDATION.materialsNeeded.max,
      WORKSHOP_ERROR_MESSAGES.materialsNeeded.max,
    ),

  topic: z
    .string()
    .trim()
    .max(WORKSHOP_VALIDATION.topic.max, WORKSHOP_ERROR_MESSAGES.topic.max)
    .refine(
      (val) => val === "" || val.length >= WORKSHOP_VALIDATION.topic.min,
      WORKSHOP_ERROR_MESSAGES.topic.min,
    ),

  creditCost: z
    .number()
    .int(WORKSHOP_ERROR_MESSAGES.creditCost.integer)
    .min(
      WORKSHOP_VALIDATION.creditCost.min,
      WORKSHOP_ERROR_MESSAGES.creditCost.min,
    )
    .max(
      WORKSHOP_VALIDATION.creditCost.max,
      WORKSHOP_ERROR_MESSAGES.creditCost.max,
    ),
} as const;

// --- SCHÉMAS BACKEND ---
export const createWorkshopBackendSchema = z.object({
  title: workshopFieldSchemas.title,
  description: workshopFieldSchemas.description.optional().default(""),
  topic: workshopFieldSchemas.topic.optional().nullable(),
  date: workshopFieldSchemas.date
    .refine(
      (date) => isMinimumTomorrow(date),
      WORKSHOP_ERROR_MESSAGES.date.minimumTomorrow,
    )
    .optional()
    .nullable(),
  time: workshopFieldSchemas.time.optional().nullable(),
  duration: workshopFieldSchemas.duration.optional().nullable(),
  location: workshopFieldSchemas.location.optional().nullable(),
  isVirtual: workshopFieldSchemas.isVirtual.optional().default(false),
  maxParticipants: workshopFieldSchemas.maxParticipants.optional().nullable(),
  materialsNeeded: workshopFieldSchemas.materialsNeeded.optional().nullable(),
  creditCost: workshopFieldSchemas.creditCost.optional().nullable(),
});

export const updateWorkshopBackendSchema = z.object({
  workshopId: z.string().min(1),
  title: workshopFieldSchemas.title.optional(),
  description: workshopFieldSchemas.description.optional(),
  topic: workshopFieldSchemas.topic.optional().nullable(),
  date: workshopFieldSchemas.date
    .refine(isMinimumToday, "La date ne peut pas être dans le passé")
    .optional(),
  time: workshopFieldSchemas.time.optional(),
  duration: workshopFieldSchemas.duration.optional(),
  location: workshopFieldSchemas.location.optional().nullable(),
  isVirtual: workshopFieldSchemas.isVirtual.optional(),
  maxParticipants: workshopFieldSchemas.maxParticipants.optional().nullable(),
  materialsNeeded: workshopFieldSchemas.materialsNeeded.optional().nullable(),
  creditCost: workshopFieldSchemas.creditCost.optional().nullable(),
});

// --- SCHÉMAS FRONTEND ---
export const createWorkshopFrontendSchema = z.object({
  title: workshopFieldSchemas.title,
  description: workshopFieldSchemas.description.optional(),
  date: z
    .string()
    .optional()
    .refine(isMinimumTomorrow, WORKSHOP_ERROR_MESSAGES.date.minimumTomorrow),
  time: z
    .string()
    .optional()
    .refine(
      (val) => !val || WORKSHOP_VALIDATION.time.regex.test(val),
      WORKSHOP_ERROR_MESSAGES.time.invalidFormat,
    ),
  durationHours: z.number().int().min(0).max(8),
  durationMinutes: z.number().int().min(0).max(59),
  location: workshopFieldSchemas.location.optional(),
  isVirtual: workshopFieldSchemas.isVirtual,
  maxParticipants: workshopFieldSchemas.maxParticipants.optional(),
  materialsNeeded: workshopFieldSchemas.materialsNeeded.optional(),
  topic: workshopFieldSchemas.topic.optional().nullable(),
  creditCost: workshopFieldSchemas.creditCost.optional().nullable(),
});

export const editWorkshopFrontendSchema = z.object({
  workshopId: z.string().min(1),
  title: workshopFieldSchemas.title,
  description: workshopFieldSchemas.description.optional(),
  date: z
    .string()
    .optional()
    .refine(isMinimumToday, "La date ne peut pas être dans le passé"),
  time: z
    .string()
    .optional()
    .refine(
      (val) => !val || WORKSHOP_VALIDATION.time.regex.test(val),
      WORKSHOP_ERROR_MESSAGES.time.invalidFormat,
    ),
  durationHours: z.number().int().min(0).max(8),
  durationMinutes: z.number().int().min(0).max(59),
  location: workshopFieldSchemas.location.optional(),
  isVirtual: workshopFieldSchemas.isVirtual,
  maxParticipants: workshopFieldSchemas.maxParticipants.optional(),
  materialsNeeded: workshopFieldSchemas.materialsNeeded.optional(),
  topic: z
    .string()
    .trim()
    .max(WORKSHOP_VALIDATION.topic.max, WORKSHOP_ERROR_MESSAGES.topic.max)
    .refine(
      (val) => val === "" || val.length >= WORKSHOP_VALIDATION.topic.min,
      WORKSHOP_ERROR_MESSAGES.topic.min,
    )
    .optional()
    .nullable(),
  creditCost: workshopFieldSchemas.creditCost.optional().nullable(),
});

// --- SCHÉMAS DE CYCLE DE VIE ---
export const publishWorkshopSchema = z.object({
  workshopId: z.string().min(1),
});

export const unpublishWorkshopSchema = z.object({
  workshopId: z.string().min(1),
});

export const deleteWorkshopSchema = z.object({
  workshopId: z.string().min(1),
});

export const cancelWorkshopSchema = z.object({
  workshopId: z.string().min(1),
});

// Types partagés
export type CreateWorkshopBackendInput = z.infer<
  typeof createWorkshopBackendSchema
>;
export type UpdateWorkshopBackendInput = z.infer<
  typeof updateWorkshopBackendSchema
>;
export type CreateWorkshopFrontendData = z.infer<
  typeof createWorkshopFrontendSchema
>;
export type EditWorkshopFrontendData = z.infer<
  typeof editWorkshopFrontendSchema
>;
export type PublishWorkshopInput = z.infer<typeof publishWorkshopSchema>;
export type UnpublishWorkshopInput = z.infer<typeof unpublishWorkshopSchema>;
export type DeleteWorkshopInput = z.infer<typeof deleteWorkshopSchema>;
export type CancelWorkshopInput = z.infer<typeof cancelWorkshopSchema>;
