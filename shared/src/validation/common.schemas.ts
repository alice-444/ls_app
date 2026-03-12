import { z } from "zod";

export const idSchema = z.object({
  id: z.string().cuid(),
});

export const userIdSchema = z.object({
  userId: z.string().cuid(),
});

export const mentorIdSchema = z.object({
  mentorId: z.string().cuid(),
});

export const workshopIdSchema = z.object({
  workshopId: z.string().cuid(),
});

export const conversationIdSchema = z.object({
  conversationId: z.string().cuid(),
});

export const messageIdSchema = z.object({
  messageId: z.string().cuid(),
});

export const requestIdSchema = z.object({
  requestId: z.string().cuid(),
});

export const notificationIdSchema = z.object({
  notificationId: z.string().cuid(),
});

export const feedbackIdSchema = z.object({
  feedbackId: z.string().cuid(),
});

export const apprenticeIdSchema = z.object({
  apprenticeId: z.string().cuid(),
});

export const apprenticeUserIdSchema = z.object({
  apprenticeUserId: z.string().cuid(),
});

export const connectionIdSchema = z.object({
  connectionId: z.string().cuid(),
});

export const receiverUserIdSchema = z.object({
  receiverUserId: z.string().cuid(),
});

export const otherUserIdSchema = z.object({
  otherUserId: z.string().cuid(),
});

export const pollIdSchema = z.object({
  pollId: z.string().cuid(),
});

export const optionIdSchema = z.object({
  optionId: z.string().cuid(),
});

export const reactionIdSchema = z.object({
  reactionId: z.string().cuid(),
});

export const paginationSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  cursor: z.string().nullish(),
});
