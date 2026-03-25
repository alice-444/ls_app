import { z } from "zod";

export const USER_ROLES = ["MENTOR", "APPRENTICE", "ADMIN"] as const;
export const USER_STATUS = ["PENDING", "ACTIVE", "BLOCKED", "DELETED"] as const;

export const userRoleSchema = z.enum(USER_ROLES);
export const userStatusSchema = z.enum(USER_STATUS);

export const updatePublicProfileSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom est requis")
    .max(120, "Le nom est trop long")
    .optional(),
  bio: z
    .string()
    .max(300, "La bio ne doit pas dépasser 300 caractères")
    .nullable()
    .optional(),
  photoUrl: z.string().url("URL de photo invalide").nullable().optional(),
  emailNotifications: z.boolean().optional(),
  inAppNotifications: z.boolean().optional(),
});

export type UpdatePublicProfileInput = z.infer<
  typeof updatePublicProfileSchema
>;
