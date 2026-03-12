import { z } from "zod";

export const SOCIAL_PLATFORMS = [
  "linkedin",
  "twitter",
  "youtube",
  "github",
] as const;

export const mentorProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(40, "Le nom ne peut pas dépasser 40 caractères"),
  bio: z
    .string()
    .trim()
    .min(20, "La bio doit contenir au moins 20 caractères")
    .max(250, "La bio ne peut pas dépasser 250 caractères"),
  domain: z
    .string()
    .trim()
    .min(2, "Le domaine doit contenir au moins 2 caractères")
    .max(60, "Le domaine ne peut pas dépasser 60 caractères"),
  photoUrl: z.union([z.string(), z.null(), z.undefined()]).optional(),
  qualifications: z
    .string()
    .trim()
    .max(500, "Les qualifications ne peuvent pas dépasser 500 caractères")
    .optional()
    .nullable(),
  experience: z
    .string()
    .trim()
    .max(700, "L'expérience ne peut pas dépasser 700 caractères")
    .optional()
    .nullable(),
  socialMediaLinks: z
    .record(z.enum(SOCIAL_PLATFORMS), z.string().url("URL invalide"))
    .optional()
    .nullable(),
  areasOfExpertise: z
    .array(z.string().trim().min(1).max(50))
    .min(1, "Au moins un domaine d'expertise est requis")
    .max(10, "Maximum 10 domaines d'expertise"),
  mentorshipTopics: z
    .array(z.string().trim().min(1).max(50))
    .max(15, "Maximum 15 sujets")
    .optional()
    .nullable(),
  displayName: z
    .string()
    .trim()
    .max(50, "Le nom d'affichage ne peut pas dépasser 50 caractères")
    .optional()
    .nullable(),
  iceBreakerTags: z
    .array(z.string().trim().min(1).max(30))
    .max(5, "Maximum 5 tags d'ice-breaker")
    .optional()
    .nullable(),
});

export type MentorProfileInput = z.infer<typeof mentorProfileSchema>;
