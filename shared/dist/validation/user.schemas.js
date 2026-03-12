"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePublicProfileSchema = exports.userStatusSchema = exports.userRoleSchema = exports.USER_STATUS = exports.USER_ROLES = void 0;
const zod_1 = require("zod");
exports.USER_ROLES = ["MENTOR", "APPRENTICE", "ADMIN"];
exports.USER_STATUS = ["PENDING", "ACTIVE", "BLOCKED", "DELETED"];
exports.userRoleSchema = zod_1.z.enum(exports.USER_ROLES);
exports.userStatusSchema = zod_1.z.enum(exports.USER_STATUS);
exports.updatePublicProfileSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(1, "Le nom est requis")
        .max(120, "Le nom est trop long")
        .optional(),
    bio: zod_1.z
        .string()
        .max(300, "La bio ne doit pas dépasser 300 caractères")
        .nullable()
        .optional(),
    photoUrl: zod_1.z.string().url("URL de photo invalide").nullable().optional(),
    emailNotifications: zod_1.z.boolean().optional(),
    inAppNotifications: zod_1.z.boolean().optional(),
});
