import { z } from "zod";
import {
  WORKSHOP_VALIDATION,
  WORKSHOP_ERROR_MESSAGES,
} from "./workshop.constants";
import { isMinimumTomorrow } from "./date.validators";

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
      WORKSHOP_ERROR_MESSAGES.description.max
    ),

  date: z.coerce
    .date()
    .refine(
      (date) => isMinimumTomorrow(date),
      WORKSHOP_ERROR_MESSAGES.date.minimumTomorrow
    ),

  time: z
    .string()
    .trim()
    .regex(
      WORKSHOP_VALIDATION.time.regex,
      WORKSHOP_ERROR_MESSAGES.time.invalidFormat
    ),

  duration: z
    .number()
    .int(WORKSHOP_ERROR_MESSAGES.duration.integer)
    .min(WORKSHOP_VALIDATION.duration.min, WORKSHOP_ERROR_MESSAGES.duration.min)
    .max(
      WORKSHOP_VALIDATION.duration.max,
      WORKSHOP_ERROR_MESSAGES.duration.max
    ),

  location: z
    .string()
    .trim()
    .max(
      WORKSHOP_VALIDATION.location.max,
      WORKSHOP_ERROR_MESSAGES.location.max
    ),

  isVirtual: z.boolean(),

  maxParticipants: z
    .number()
    .int(WORKSHOP_ERROR_MESSAGES.maxParticipants.integer)
    .min(
      WORKSHOP_VALIDATION.maxParticipants.min,
      WORKSHOP_ERROR_MESSAGES.maxParticipants.min
    )
    .max(
      WORKSHOP_VALIDATION.maxParticipants.max,
      WORKSHOP_ERROR_MESSAGES.maxParticipants.max
    ),

  materialsNeeded: z
    .string()
    .trim()
    .max(
      WORKSHOP_VALIDATION.materialsNeeded.max,
      WORKSHOP_ERROR_MESSAGES.materialsNeeded.max
    ),

  topic: z
    .string()
    .trim()
    .min(WORKSHOP_VALIDATION.topic.min, WORKSHOP_ERROR_MESSAGES.topic.min)
    .max(WORKSHOP_VALIDATION.topic.max, WORKSHOP_ERROR_MESSAGES.topic.max),

  creditCost: z
    .number()
    .int("Le nombre de crédits doit être un nombre entier")
    .min(20, "Le nombre minimum de crédits est 20")
    .max(100, "Le nombre maximum de crédits est 100"),
} as const;

export const createWorkshopBackendSchema = z.object({
  title: workshopFieldSchemas.title,
  description: workshopFieldSchemas.description.optional().default(""),
  topic: workshopFieldSchemas.topic.optional().nullable(),
  date: workshopFieldSchemas.date.optional().nullable(),
  time: workshopFieldSchemas.time.optional().nullable(),
  duration: workshopFieldSchemas.duration.optional().nullable(),
  location: workshopFieldSchemas.location.optional().nullable(),
  isVirtual: workshopFieldSchemas.isVirtual.optional().default(false),
  maxParticipants: workshopFieldSchemas.maxParticipants.optional().nullable(),
  materialsNeeded: workshopFieldSchemas.materialsNeeded.optional().nullable(),
  creditCost: workshopFieldSchemas.creditCost.optional().nullable(),
});

export const updateWorkshopBackendSchema = z.object({
  workshopId: z.string().uuid(),
  title: workshopFieldSchemas.title.optional(),
  description: workshopFieldSchemas.description.optional(),
  topic: workshopFieldSchemas.topic.optional().nullable(),
  date: workshopFieldSchemas.date.optional(),
  time: workshopFieldSchemas.time.optional(),
  duration: workshopFieldSchemas.duration.optional(),
  location: workshopFieldSchemas.location.optional().nullable(),
  isVirtual: workshopFieldSchemas.isVirtual.optional(),
  maxParticipants: workshopFieldSchemas.maxParticipants.optional().nullable(),
  materialsNeeded: workshopFieldSchemas.materialsNeeded.optional().nullable(),
  creditCost: workshopFieldSchemas.creditCost.optional().nullable(),
});

export const publishWorkshopSchema = z.object({
  workshopId: z.string().uuid(),
});

export const unpublishWorkshopSchema = z.object({
  workshopId: z.string().uuid(),
});

export const deleteWorkshopSchema = z.object({
  workshopId: z.string().uuid(),
});

export type CreateWorkshopBackendInput = z.infer<
  typeof createWorkshopBackendSchema
>;
export type UpdateWorkshopBackendInput = z.infer<
  typeof updateWorkshopBackendSchema
>;
export type PublishWorkshopInput = z.infer<typeof publishWorkshopSchema>;
export type DeleteWorkshopInput = z.infer<typeof deleteWorkshopSchema>;
