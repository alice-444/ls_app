"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkNotificationSchema = exports.segmentationCriteriaSchema = void 0;
const zod_1 = require("zod");
exports.segmentationCriteriaSchema = zod_1.z.object({
    role: zod_1.z.enum(["MENTOR", "APPRENANT", "ADMIN"]).optional(),
    status: zod_1.z.enum(["PENDING", "ACTIVE", "SUSPENDED"]).optional(),
    isPublished: zod_1.z.boolean().optional(),
    hasPublishedWorkshop: zod_1.z.boolean().optional(),
    minCredits: zod_1.z.number().optional(),
    maxCredits: zod_1.z.number().optional(),
});
exports.bulkNotificationSchema = zod_1.z.object({
    criteria: exports.segmentationCriteriaSchema,
    title: zod_1.z.string().min(1, "Le titre est requis"),
    message: zod_1.z.string().min(1, "Le message est requis"),
    type: zod_1.z.string().default("SYSTEM"),
    actionUrl: zod_1.z.string().optional(),
});
