"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserCreditsSchema = exports.adminAnalyticsSchema = void 0;
const zod_1 = require("zod");
exports.adminAnalyticsSchema = zod_1.z.object({
    timeRange: zod_1.z.enum(['7d', '30d', '90d', 'all']).default('30d')
});
exports.updateUserCreditsSchema = zod_1.z.object({
    userId: zod_1.z.string().cuid(),
    amount: zod_1.z.number().min(1),
    reason: zod_1.z.string().min(3),
    type: zod_1.z.enum(["ADD", "REMOVE"]),
});
