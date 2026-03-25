import { z } from "zod";
export declare const idSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const userIdSchema: z.ZodObject<{
    userId: z.ZodString;
}, z.core.$strip>;
export declare const mentorIdSchema: z.ZodObject<{
    mentorId: z.ZodString;
}, z.core.$strip>;
export declare const workshopIdSchema: z.ZodObject<{
    workshopId: z.ZodString;
}, z.core.$strip>;
export declare const conversationIdSchema: z.ZodObject<{
    conversationId: z.ZodString;
}, z.core.$strip>;
export declare const messageIdSchema: z.ZodObject<{
    messageId: z.ZodString;
}, z.core.$strip>;
export declare const requestIdSchema: z.ZodObject<{
    requestId: z.ZodString;
}, z.core.$strip>;
export declare const notificationIdSchema: z.ZodObject<{
    notificationId: z.ZodString;
}, z.core.$strip>;
export declare const feedbackIdSchema: z.ZodObject<{
    feedbackId: z.ZodString;
}, z.core.$strip>;
export declare const apprenticeIdSchema: z.ZodObject<{
    apprenticeId: z.ZodString;
}, z.core.$strip>;
export declare const apprenticeUserIdSchema: z.ZodObject<{
    apprenticeUserId: z.ZodString;
}, z.core.$strip>;
export declare const connectionIdSchema: z.ZodObject<{
    connectionId: z.ZodString;
}, z.core.$strip>;
export declare const receiverUserIdSchema: z.ZodObject<{
    receiverUserId: z.ZodString;
}, z.core.$strip>;
export declare const otherUserIdSchema: z.ZodObject<{
    otherUserId: z.ZodString;
}, z.core.$strip>;
export declare const pollIdSchema: z.ZodObject<{
    pollId: z.ZodString;
}, z.core.$strip>;
export declare const optionIdSchema: z.ZodObject<{
    optionId: z.ZodString;
}, z.core.$strip>;
export declare const reactionIdSchema: z.ZodObject<{
    reactionId: z.ZodString;
}, z.core.$strip>;
export declare const bulkIdsSchema: z.ZodObject<{
    ids: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export declare const bulkUserIdsSchema: z.ZodObject<{
    userIds: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export declare const paginationSchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodNumber>;
    cursor: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
