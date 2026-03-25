import { z } from "zod";

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
  photo: z
    .union([
      z
        .instanceof(File)
        .refine(
          (file) =>
            ["image/jpeg", "image/jpg", "image/png"].includes(
              file.type.toLowerCase(),
            ),
          "Le fichier doit être au format JPG ou PNG",
        )
        .refine(
          (file) => file.size <= 5 * 1024 * 1024,
          "La photo ne doit pas dépasser 5 Mo",
        ),
      z.null(),
      z.undefined(),
    ])
    .optional(),
  qualifications: z
    .array(z.string().trim().min(1).max(100))
    .max(20, "Maximum 20 qualifications")
    .optional()
    .nullable(),
  experience: z
    .array(z.string().trim().min(1).max(100))
    .max(20, "Maximum 20 expériences")
    .optional()
    .nullable(),
  socialMediaLinks: z
    .object({
      linkedin: z.string().url("URL invalide").optional().or(z.literal("")),
      twitter: z.string().url("URL invalide").optional().or(z.literal("")),
      youtube: z.string().url("URL invalide").optional().or(z.literal("")),
      github: z.string().url("URL invalide").optional().or(z.literal("")),
    })
    .optional()
    .nullable(),
  areasOfExpertise: z
    .array(z.string().trim().min(1).max(50))
    .min(1, "Au moins un domaine d'expertise est requis")
    .max(10, "Maximum 10 domaines d'expertise"),
  mentorshipTopics: z
    .array(z.string().trim().min(1).max(50))
    .max(15, "Maximum 15 sujets de mentorat")
    .optional()
    .nullable(),
  displayName: z
    .string()
    .trim()
    .max(50, "Le nom d'affichage ne peut pas dépasser 50 caractères")
    .optional()
    .nullable()
    .or(z.literal("")),
  iceBreakerTags: z
    .array(z.string().trim().min(1).max(30))
    .max(5, "Maximum 5 tags d'ice-breaker")
    .optional()
    .nullable(),
});

export type MentorProfileFormData = z.infer<typeof mentorProfileSchema>;
