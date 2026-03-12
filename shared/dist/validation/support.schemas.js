"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUPPORT_ATTACHMENT_CONFIG = exports.supportRequestSchema = void 0;
const zod_1 = require("zod");
exports.supportRequestSchema = zod_1.z.object({
    email: zod_1.z.string().email("L'adresse email est invalide."),
    subject: zod_1.z
        .string()
        .min(1, "Le sujet est requis.")
        .max(200, "Le sujet ne doit pas dépasser 200 caractères."),
    description: zod_1.z
        .string()
        .min(10, "La description doit contenir au moins 10 caractères.")
        .max(5000, "La description ne doit pas dépasser 5000 caractères."),
    problemType: zod_1.z.string().min(1, "Le type de problème est requis."),
});
exports.SUPPORT_ATTACHMENT_CONFIG = {
    maxSize: 10 * 1024 * 1024, // 10MB
    maxCount: 5,
    allowedMimeTypes: [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
};
