import { z } from "zod";
import {
  PROFILE_VALIDATION,
  PROFILE_ERROR_MESSAGES,
} from "./profile.constants";

export const signUpInputSchema = z.object({
  email: z.string().email("L'adresse email est invalide."),
  password: z
    .string()
    .min(
      PROFILE_VALIDATION.password.minLength,
      PROFILE_ERROR_MESSAGES.password.minLength,
    )
    .regex(/\d/, PROFILE_ERROR_MESSAGES.password.requireNumber),
  name: z
    .string()
    .min(PROFILE_VALIDATION.name.min, PROFILE_ERROR_MESSAGES.name.min)
    .max(PROFILE_VALIDATION.name.max, PROFILE_ERROR_MESSAGES.name.max),
  username: z
    .string()
    .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
    .max(30, "Le nom d'utilisateur ne doit pas dépasser 30 caractères"),
});

export type SignUpInput = z.infer<typeof signUpInputSchema>;

export const signInInputSchema = z.object({
  email: z.string().email("L'adresse email est invalide."),
  password: z.string().min(1, "Le mot de passe est requis."),
});

export type SignInInput = z.infer<typeof signInInputSchema>;
