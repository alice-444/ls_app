"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signInInputSchema = exports.signUpInputSchema = void 0;
const zod_1 = require("zod");
const profile_constants_1 = require("./profile.constants");
exports.signUpInputSchema = zod_1.z.object({
    email: zod_1.z.string().email("L'adresse email est invalide."),
    password: zod_1.z
        .string()
        .min(profile_constants_1.PROFILE_VALIDATION.password.minLength, profile_constants_1.PROFILE_ERROR_MESSAGES.password.minLength)
        .regex(/\d/, profile_constants_1.PROFILE_ERROR_MESSAGES.password.requireNumber),
    name: zod_1.z
        .string()
        .min(profile_constants_1.PROFILE_VALIDATION.name.min, profile_constants_1.PROFILE_ERROR_MESSAGES.name.min)
        .max(profile_constants_1.PROFILE_VALIDATION.name.max, profile_constants_1.PROFILE_ERROR_MESSAGES.name.max),
    username: zod_1.z
        .string()
        .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
        .max(30, "Le nom d'utilisateur ne doit pas dépasser 30 caractères"),
});
exports.signInInputSchema = zod_1.z.object({
    email: zod_1.z.string().email("L'adresse email est invalide."),
    password: zod_1.z.string().min(1, "Le mot de passe est requis."),
});
