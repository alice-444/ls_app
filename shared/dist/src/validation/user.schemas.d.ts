import { z } from "zod";
export declare const USER_ROLES: readonly ["MENTOR", "APPRENTICE", "ADMIN"];
export declare const USER_STATUS: readonly ["PENDING", "ACTIVE", "BLOCKED", "DELETED"];
export declare const userRoleSchema: z.ZodEnum<{
    MENTOR: "MENTOR";
    APPRENTICE: "APPRENTICE";
    ADMIN: "ADMIN";
}>;
export declare const userStatusSchema: z.ZodEnum<{
    PENDING: "PENDING";
    ACTIVE: "ACTIVE";
    BLOCKED: "BLOCKED";
    DELETED: "DELETED";
}>;
export declare const updatePublicProfileSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    photoUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    emailNotifications: z.ZodOptional<z.ZodBoolean>;
    inAppNotifications: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type UpdatePublicProfileInput = z.infer<typeof updatePublicProfileSchema>;
