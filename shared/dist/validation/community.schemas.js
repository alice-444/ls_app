"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.communityPollSchema = exports.communityEventSchema = exports.communitySpotSchema = exports.studentDealSchema = void 0;
const zod_1 = require("zod");
exports.studentDealSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(100),
    description: zod_1.z.string().min(10).max(1000),
    category: zod_1.z.enum(["FOOD", "SOFTWARE", "LEISURE", "SERVICES"]),
    link: zod_1.z.string().url(),
    promoCode: zod_1.z.string().optional().nullable(),
    imageUrl: zod_1.z.string().url().optional().nullable(),
});
exports.communitySpotSchema = zod_1.z.object({
    name: zod_1.z.string().min(3).max(100),
    description: zod_1.z.string().min(10).max(1000),
    address: zod_1.z.string().min(5).max(200),
    tags: zod_1.z.array(zod_1.z.string()).min(1).max(10),
    imageUrl: zod_1.z.string().url().optional().nullable(),
});
exports.communityEventSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(100),
    description: zod_1.z.string().min(10).max(2000),
    date: zod_1.z.coerce.date(),
    location: zod_1.z.string().min(3).max(200),
    link: zod_1.z.string().url().optional().nullable(),
    imageUrl: zod_1.z.string().url().optional().nullable(),
});
exports.communityPollSchema = zod_1.z.object({
    question: zod_1.z.string().min(10).max(200),
    options: zod_1.z
        .array(zod_1.z.object({
        label: zod_1.z.string().min(1).max(100),
    }))
        .min(2)
        .max(10),
});
