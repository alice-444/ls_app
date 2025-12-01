import { z } from "zod";
import {
  WORKSHOP_VALIDATION,
  WORKSHOP_ERROR_MESSAGES,
} from "../../../../server/src/shared/validation/workshop.constants";
import { isMinimumTomorrow } from "../../../../server/src/shared/validation/date.validators";

export const createWorkshopFrontendSchema = z.object({
  title: z
    .string()
    .min(WORKSHOP_VALIDATION.title.min, WORKSHOP_ERROR_MESSAGES.title.min)
    .max(WORKSHOP_VALIDATION.title.max, WORKSHOP_ERROR_MESSAGES.title.max),

  description: z
    .string()
    .max(
      WORKSHOP_VALIDATION.description.max,
      WORKSHOP_ERROR_MESSAGES.description.max
    )
    .optional(),

  date: z
    .string()
    .optional()
    .refine(
      (date) => isMinimumTomorrow(date),
      WORKSHOP_ERROR_MESSAGES.date.minimumTomorrow
    ),

  time: z
    .string()
    .optional()
    .refine(
      (val) => !val || WORKSHOP_VALIDATION.time.regex.test(val),
      WORKSHOP_ERROR_MESSAGES.time.invalidFormat
    ),

  durationHours: z
    .number()
    .int()
    .min(0, WORKSHOP_ERROR_MESSAGES.durationHours.min)
    .max(8, WORKSHOP_ERROR_MESSAGES.durationHours.max),

  durationMinutes: z
    .number()
    .int()
    .min(0, WORKSHOP_ERROR_MESSAGES.durationMinutes.min)
    .max(59, WORKSHOP_ERROR_MESSAGES.durationMinutes.max),

  location: z
    .string()
    .max(WORKSHOP_VALIDATION.location.max, WORKSHOP_ERROR_MESSAGES.location.max)
    .optional(),

  isVirtual: z.boolean(),

  maxParticipants: z
    .number()
    .int()
    .min(
      WORKSHOP_VALIDATION.maxParticipants.min,
      WORKSHOP_ERROR_MESSAGES.maxParticipants.range
    )
    .max(
      WORKSHOP_VALIDATION.maxParticipants.max,
      WORKSHOP_ERROR_MESSAGES.maxParticipants.range
    )
    .optional(),

  materialsNeeded: z
    .string()
    .max(
      WORKSHOP_VALIDATION.materialsNeeded.max,
      WORKSHOP_ERROR_MESSAGES.materialsNeeded.max
    )
    .optional(),

  topic: z
    .string()
    .min(WORKSHOP_VALIDATION.topic.min, WORKSHOP_ERROR_MESSAGES.topic.min)
    .max(WORKSHOP_VALIDATION.topic.max, WORKSHOP_ERROR_MESSAGES.topic.max)
    .optional()
    .nullable(),

  creditCost: z
    .number()
    .int("Le nombre de crédits doit être un nombre entier")
    .min(20, "Le nombre minimum de crédits est 20")
    .max(100, "Le nombre maximum de crédits est 100")
    .optional()
    .nullable(),
});

export const editWorkshopFrontendSchema = createWorkshopFrontendSchema.extend({
  workshopId: z.string().uuid(),
});

export type CreateWorkshopFrontendData = z.infer<
  typeof createWorkshopFrontendSchema
>;
export type EditWorkshopFrontendData = z.infer<
  typeof editWorkshopFrontendSchema
>;
