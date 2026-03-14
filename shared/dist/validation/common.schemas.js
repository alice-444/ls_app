"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationSchema = exports.bulkUserIdsSchema = exports.bulkIdsSchema = exports.reactionIdSchema = exports.optionIdSchema = exports.pollIdSchema = exports.otherUserIdSchema = exports.receiverUserIdSchema = exports.connectionIdSchema = exports.apprenticeUserIdSchema = exports.apprenticeIdSchema = exports.feedbackIdSchema = exports.notificationIdSchema = exports.requestIdSchema = exports.messageIdSchema = exports.conversationIdSchema = exports.workshopIdSchema = exports.mentorIdSchema = exports.userIdSchema = exports.idSchema = void 0;
const zod_1 = require("zod");
exports.idSchema = zod_1.z.object({
    id: zod_1.z.string(),
});
exports.userIdSchema = zod_1.z.object({
    userId: zod_1.z.string(),
});
exports.mentorIdSchema = zod_1.z.object({
    mentorId: zod_1.z.string(),
});
exports.workshopIdSchema = zod_1.z.object({
    workshopId: zod_1.z.string(),
});
exports.conversationIdSchema = zod_1.z.object({
    conversationId: zod_1.z.string(),
});
exports.messageIdSchema = zod_1.z.object({
    messageId: zod_1.z.string(),
});
exports.requestIdSchema = zod_1.z.object({
    requestId: zod_1.z.string(),
});
exports.notificationIdSchema = zod_1.z.object({
    notificationId: zod_1.z.string(),
});
exports.feedbackIdSchema = zod_1.z.object({
    feedbackId: zod_1.z.string(),
});
exports.apprenticeIdSchema = zod_1.z.object({
    apprenticeId: zod_1.z.string(),
});
exports.apprenticeUserIdSchema = zod_1.z.object({
    apprenticeUserId: zod_1.z.string(),
});
exports.connectionIdSchema = zod_1.z.object({
    connectionId: zod_1.z.string(),
});
exports.receiverUserIdSchema = zod_1.z.object({
    receiverUserId: zod_1.z.string(),
});
exports.otherUserIdSchema = zod_1.z.object({
    otherUserId: zod_1.z.string(),
});
exports.pollIdSchema = zod_1.z.object({
    pollId: zod_1.z.string(),
});
exports.optionIdSchema = zod_1.z.object({
    optionId: zod_1.z.string(),
});
exports.reactionIdSchema = zod_1.z.object({
    reactionId: zod_1.z.string(),
});
exports.bulkIdsSchema = zod_1.z.object({
    ids: zod_1.z.array(zod_1.z.string()),
});
exports.bulkUserIdsSchema = zod_1.z.object({
    userIds: zod_1.z.array(zod_1.z.string()),
});
exports.paginationSchema = zod_1.z.object({
    limit: zod_1.z.number().min(1).max(100).default(20),
    cursor: zod_1.z.string().nullish(),
});
