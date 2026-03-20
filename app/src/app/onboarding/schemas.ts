import { z } from "zod";

export const profFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Le nom est obligatoire")
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(40, "Le nom ne peut pas dépasser 40 caractères"),
  bio: z
    .string()
    .trim()
    .min(1, "La bio est obligatoire")
    .min(10, "La bio doit contenir au moins 10 caractères")
    .max(250, "La bio ne peut pas dépasser 250 caractères"),
  domain: z
    .string()
    .trim()
    .min(1, "Le domaine est obligatoire")
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
});

export type ProfFormData = z.infer<typeof profFormSchema>;
