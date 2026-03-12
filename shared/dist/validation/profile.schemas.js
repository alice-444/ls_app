"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mentorProfileSchema = exports.SOCIAL_PLATFORMS = void 0;
const zod_1 = require("zod");
exports.SOCIAL_PLATFORMS = ["linkedin", "twitter", "youtube", "github"];
exports.mentorProfileSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .trim()
        .min(2, "Le nom doit contenir au moins 2 caractères")
        .max(40, "Le nom ne peut pas dépasser 40 caractères"),
    bio: zod_1.z
        .string()
        .trim()
        .min(20, "La bio doit contenir au moins 20 caractères")
        .max(250, "La bio ne peut pas dépasser 250 caractères"),
    domain: zod_1.z
        .string()
        .trim()
        .min(2, "Le domaine doit contenir au moins 2 caractères")
        .max(60, "Le domaine ne peut pas dépasser 60 caractères"),
    photoUrl: zod_1.z.union([zod_1.z.string(), zod_1.z.null(), zod_1.z.undefined()]).optional(),
    qualifications: zod_1.z
        .string()
        .trim()
        .max(500, "Les qualifications ne peuvent pas dépasser 500 caractères")
        .optional()
        .nullable(),
    experience: zod_1.z
        .string()
        .trim()
        .max(700, "L'expérience ne peut pas dépasser 700 caractères")
        .optional()
        .nullable(),
    socialMediaLinks: zod_1.z
        .record(zod_1.z.enum(exports.SOCIAL_PLATFORMS), zod_1.z.string().url("URL invalide"))
        .optional()
        .nullable(),
    areasOfExpertise: zod_1.z
        .array(zod_1.z.string().trim().min(1).max(50))
        .min(1, "Au moins un domaine d'expertise est requis")
        .max(10, "Maximum 10 domaines d'expertise"),
    mentorshipTopics: zod_1.z
        .array(zod_1.z.string().trim().min(1).max(50))
        .max(15, "Maximum 15 sujets")
        .optional()
        .nullable(),
    displayName: zod_1.z
        .string()
        .trim()
        .max(50, "Le nom d'affichage ne peut pas dépasser 50 caractères")
        .optional()
        .nullable(),
    iceBreakerTags: zod_1.z
        .array(zod_1.z.string().trim().min(1).max(30))
        .max(5, "Maximum 5 tags d'ice-breaker")
        .optional()
        .nullable(),
});
