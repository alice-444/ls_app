"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationSchema = exports.reactionIdSchema = exports.optionIdSchema = exports.pollIdSchema = exports.otherUserIdSchema = exports.receiverUserIdSchema = exports.connectionIdSchema = exports.apprenticeUserIdSchema = exports.apprenticeIdSchema = exports.feedbackIdSchema = exports.notificationIdSchema = exports.requestIdSchema = exports.messageIdSchema = exports.conversationIdSchema = exports.workshopIdSchema = exports.mentorIdSchema = exports.userIdSchema = exports.idSchema = void 0;
const zod_1 = require("zod");
exports.idSchema = zod_1.z.object({
    id: zod_1.z.string().cuid(),
});
exports.userIdSchema = zod_1.z.object({
    userId: zod_1.z.string().cuid(),
});
exports.mentorIdSchema = zod_1.z.object({
    mentorId: zod_1.z.string().cuid(),
});
exports.workshopIdSchema = zod_1.z.object({
    workshopId: zod_1.z.string().cuid(),
});
exports.conversationIdSchema = zod_1.z.object({
    conversationId: zod_1.z.string().cuid(),
});
exports.messageIdSchema = zod_1.z.object({
    messageId: zod_1.z.string().cuid(),
});
exports.requestIdSchema = zod_1.z.object({
    requestId: zod_1.z.string().cuid(),
});
exports.notificationIdSchema = zod_1.z.object({
    notificationId: zod_1.z.string().cuid(),
});
exports.feedbackIdSchema = zod_1.z.object({
    feedbackId: zod_1.z.string().cuid(),
});
exports.apprenticeIdSchema = zod_1.z.object({
    apprenticeId: zod_1.z.string().cuid(),
});
exports.apprenticeUserIdSchema = zod_1.z.object({
    apprenticeUserId: zod_1.z.string().cuid(),
});
exports.connectionIdSchema = zod_1.z.object({
    connectionId: zod_1.z.string().cuid(),
});
exports.receiverUserIdSchema = zod_1.z.object({
    receiverUserId: zod_1.z.string().cuid(),
});
exports.otherUserIdSchema = zod_1.z.object({
    otherUserId: zod_1.z.string().cuid(),
});
exports.pollIdSchema = zod_1.z.object({
    pollId: zod_1.z.string().cuid(),
});
exports.optionIdSchema = zod_1.z.object({
    optionId: zod_1.z.string().cuid(),
});
exports.reactionIdSchema = zod_1.z.object({
    reactionId: zod_1.z.string().cuid(),
});
exports.paginationSchema = zod_1.z.object({
    limit: zod_1.z.number().min(1).max(100).default(20),
    cursor: zod_1.z.string().nullish(),
});
