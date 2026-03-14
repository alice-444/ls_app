import { z } from "zod";

export const idSchema = z.object({
  id: z.string(),
});

export const userIdSchema = z.object({
  userId: z.string(),
});

export const mentorIdSchema = z.object({
  mentorId: z.string(),
});

export const workshopIdSchema = z.object({
  workshopId: z.string(),
});

export const conversationIdSchema = z.object({
  conversationId: z.string(),
});

export const messageIdSchema = z.object({
  messageId: z.string(),
});

export const requestIdSchema = z.object({
  requestId: z.string(),
});

export const notificationIdSchema = z.object({
  notificationId: z.string(),
});

export const feedbackIdSchema = z.object({
  feedbackId: z.string(),
});

export const apprenticeIdSchema = z.object({
  apprenticeId: z.string(),
});

export const apprenticeUserIdSchema = z.object({
  apprenticeUserId: z.string(),
});

export const connectionIdSchema = z.object({
  connectionId: z.string(),
});

export const receiverUserIdSchema = z.object({
  receiverUserId: z.string(),
});

export const otherUserIdSchema = z.object({
  otherUserId: z.string(),
});

export const pollIdSchema = z.object({
  pollId: z.string(),
});

export const optionIdSchema = z.object({
  optionId: z.string(),
});

export const reactionIdSchema = z.object({
  reactionId: z.string(),
});

export const bulkIdsSchema = z.object({
  ids: z.array(z.string()),
});

export const bulkUserIdsSchema = z.object({
  userIds: z.array(z.string()),
});

export const paginationSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  cursor: z.string().nullish(),
});
