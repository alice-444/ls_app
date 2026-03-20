"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelWorkshopSchema = exports.deleteWorkshopSchema = exports.unpublishWorkshopSchema = exports.publishWorkshopSchema = exports.editWorkshopFrontendSchema = exports.createWorkshopFrontendSchema = exports.updateWorkshopBackendSchema = exports.createWorkshopBackendSchema = exports.workshopFieldSchemas = void 0;
const zod_1 = require("zod");
const workshop_constants_1 = require("./workshop.constants");
const date_validators_1 = require("./date.validators");
// Schémas de base pour chaque champ
exports.workshopFieldSchemas = {
    title: zod_1.z
        .string()
        .trim()
        .min(workshop_constants_1.WORKSHOP_VALIDATION.title.min, workshop_constants_1.WORKSHOP_ERROR_MESSAGES.title.min)
        .max(workshop_constants_1.WORKSHOP_VALIDATION.title.max, workshop_constants_1.WORKSHOP_ERROR_MESSAGES.title.max),
    description: zod_1.z
        .string()
        .trim()
        .max(workshop_constants_1.WORKSHOP_VALIDATION.description.max, workshop_constants_1.WORKSHOP_ERROR_MESSAGES.description.max),
    date: zod_1.z.coerce
        .date()
        .refine(date_validators_1.isMinimumToday, "La date ne peut pas être dans le passé"),
    time: zod_1.z
        .string()
        .trim()
        .regex(workshop_constants_1.WORKSHOP_VALIDATION.time.regex, workshop_constants_1.WORKSHOP_ERROR_MESSAGES.time.invalidFormat),
    duration: zod_1.z
        .number()
        .int(workshop_constants_1.WORKSHOP_ERROR_MESSAGES.duration.integer)
        .min(workshop_constants_1.WORKSHOP_VALIDATION.duration.min, workshop_constants_1.WORKSHOP_ERROR_MESSAGES.duration.min)
        .max(workshop_constants_1.WORKSHOP_VALIDATION.duration.max, workshop_constants_1.WORKSHOP_ERROR_MESSAGES.duration.max),
    location: zod_1.z
        .string()
        .trim()
        .max(workshop_constants_1.WORKSHOP_VALIDATION.location.max, workshop_constants_1.WORKSHOP_ERROR_MESSAGES.location.max),
    isVirtual: zod_1.z.boolean(),
    maxParticipants: zod_1.z
        .number()
        .int(workshop_constants_1.WORKSHOP_ERROR_MESSAGES.maxParticipants.integer)
        .min(workshop_constants_1.WORKSHOP_VALIDATION.maxParticipants.min, workshop_constants_1.WORKSHOP_ERROR_MESSAGES.maxParticipants.min)
        .max(workshop_constants_1.WORKSHOP_VALIDATION.maxParticipants.max, workshop_constants_1.WORKSHOP_ERROR_MESSAGES.maxParticipants.max),
    materialsNeeded: zod_1.z
        .string()
        .trim()
        .max(workshop_constants_1.WORKSHOP_VALIDATION.materialsNeeded.max, workshop_constants_1.WORKSHOP_ERROR_MESSAGES.materialsNeeded.max),
    topic: zod_1.z
        .string()
        .trim()
        .max(workshop_constants_1.WORKSHOP_VALIDATION.topic.max, workshop_constants_1.WORKSHOP_ERROR_MESSAGES.topic.max)
        .refine((val) => val === "" || val.length >= workshop_constants_1.WORKSHOP_VALIDATION.topic.min, workshop_constants_1.WORKSHOP_ERROR_MESSAGES.topic.min),
    creditCost: zod_1.z
        .number()
        .int(workshop_constants_1.WORKSHOP_ERROR_MESSAGES.creditCost.integer)
        .min(workshop_constants_1.WORKSHOP_VALIDATION.creditCost.min, workshop_constants_1.WORKSHOP_ERROR_MESSAGES.creditCost.min)
        .max(workshop_constants_1.WORKSHOP_VALIDATION.creditCost.max, workshop_constants_1.WORKSHOP_ERROR_MESSAGES.creditCost.max),
};
// --- SCHÉMAS BACKEND ---
exports.createWorkshopBackendSchema = zod_1.z.object({
    title: exports.workshopFieldSchemas.title,
    description: exports.workshopFieldSchemas.description.optional().default(""),
    topic: exports.workshopFieldSchemas.topic.optional().nullable(),
    date: exports.workshopFieldSchemas.date
        .refine((date) => (0, date_validators_1.isMinimumTomorrow)(date), workshop_constants_1.WORKSHOP_ERROR_MESSAGES.date.minimumTomorrow)
        .optional()
        .nullable(),
    time: exports.workshopFieldSchemas.time.optional().nullable(),
    duration: exports.workshopFieldSchemas.duration.optional().nullable(),
    location: exports.workshopFieldSchemas.location.optional().nullable(),
    isVirtual: exports.workshopFieldSchemas.isVirtual.optional().default(false),
    maxParticipants: exports.workshopFieldSchemas.maxParticipants.optional().nullable(),
    materialsNeeded: exports.workshopFieldSchemas.materialsNeeded.optional().nullable(),
    creditCost: exports.workshopFieldSchemas.creditCost.optional().nullable(),
});
exports.updateWorkshopBackendSchema = zod_1.z.object({
    workshopId: zod_1.z.string().min(1),
    title: exports.workshopFieldSchemas.title.optional(),
    description: exports.workshopFieldSchemas.description.optional(),
    topic: exports.workshopFieldSchemas.topic.optional().nullable(),
    date: exports.workshopFieldSchemas.date
        .refine(date_validators_1.isMinimumToday, "La date ne peut pas être dans le passé")
        .optional(),
    time: exports.workshopFieldSchemas.time.optional(),
    duration: exports.workshopFieldSchemas.duration.optional(),
    location: exports.workshopFieldSchemas.location.optional().nullable(),
    isVirtual: exports.workshopFieldSchemas.isVirtual.optional(),
    maxParticipants: exports.workshopFieldSchemas.maxParticipants.optional().nullable(),
    materialsNeeded: exports.workshopFieldSchemas.materialsNeeded.optional().nullable(),
    creditCost: exports.workshopFieldSchemas.creditCost.optional().nullable(),
});
// --- SCHÉMAS FRONTEND ---
exports.createWorkshopFrontendSchema = zod_1.z.object({
    title: exports.workshopFieldSchemas.title,
    description: exports.workshopFieldSchemas.description.optional(),
    date: zod_1.z
        .string()
        .optional()
        .refine(date_validators_1.isMinimumTomorrow, workshop_constants_1.WORKSHOP_ERROR_MESSAGES.date.minimumTomorrow),
    time: zod_1.z
        .string()
        .optional()
        .refine((val) => !val || workshop_constants_1.WORKSHOP_VALIDATION.time.regex.test(val), workshop_constants_1.WORKSHOP_ERROR_MESSAGES.time.invalidFormat),
    durationHours: zod_1.z.number().int().min(0).max(8),
    durationMinutes: zod_1.z.number().int().min(0).max(59),
    location: exports.workshopFieldSchemas.location.optional(),
    isVirtual: exports.workshopFieldSchemas.isVirtual,
    maxParticipants: exports.workshopFieldSchemas.maxParticipants.optional(),
    materialsNeeded: exports.workshopFieldSchemas.materialsNeeded.optional(),
    topic: exports.workshopFieldSchemas.topic.optional().nullable(),
    creditCost: exports.workshopFieldSchemas.creditCost.optional().nullable(),
});
exports.editWorkshopFrontendSchema = zod_1.z.object({
    workshopId: zod_1.z.string().min(1),
    title: exports.workshopFieldSchemas.title,
    description: exports.workshopFieldSchemas.description.optional(),
    date: zod_1.z
        .string()
        .optional()
        .refine(date_validators_1.isMinimumToday, "La date ne peut pas être dans le passé"),
    time: zod_1.z
        .string()
        .optional()
        .refine((val) => !val || workshop_constants_1.WORKSHOP_VALIDATION.time.regex.test(val), workshop_constants_1.WORKSHOP_ERROR_MESSAGES.time.invalidFormat),
    durationHours: zod_1.z.number().int().min(0).max(8),
    durationMinutes: zod_1.z.number().int().min(0).max(59),
    location: exports.workshopFieldSchemas.location.optional(),
    isVirtual: exports.workshopFieldSchemas.isVirtual,
    maxParticipants: exports.workshopFieldSchemas.maxParticipants.optional(),
    materialsNeeded: exports.workshopFieldSchemas.materialsNeeded.optional(),
    topic: zod_1.z
        .string()
        .trim()
        .max(workshop_constants_1.WORKSHOP_VALIDATION.topic.max, workshop_constants_1.WORKSHOP_ERROR_MESSAGES.topic.max)
        .refine((val) => val === "" || val.length >= workshop_constants_1.WORKSHOP_VALIDATION.topic.min, workshop_constants_1.WORKSHOP_ERROR_MESSAGES.topic.min)
        .optional()
        .nullable(),
    creditCost: exports.workshopFieldSchemas.creditCost.optional().nullable(),
});
// --- SCHÉMAS DE CYCLE DE VIE ---
exports.publishWorkshopSchema = zod_1.z.object({
    workshopId: zod_1.z.string().min(1),
});
exports.unpublishWorkshopSchema = zod_1.z.object({
    workshopId: zod_1.z.string().min(1),
});
exports.deleteWorkshopSchema = zod_1.z.object({
    workshopId: zod_1.z.string().min(1),
});
exports.cancelWorkshopSchema = zod_1.z.object({
    workshopId: zod_1.z.string().min(1),
});
