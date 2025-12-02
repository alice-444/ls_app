export interface MessageReactionEntity {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: Date;
}

export interface IMessageReactionRepository {
  findByMessageId(messageId: string): Promise<MessageReactionEntity[]>;

  findByMessageIdAndUserId(
    messageId: string,
    userId: string
  ): Promise<MessageReactionEntity[]>;

  findById(reactionId: string): Promise<MessageReactionEntity | null>;

  create(data: {
    id: string;
    messageId: string;
    userId: string;
    emoji: string;
  }): Promise<MessageReactionEntity>;

  delete(reactionId: string): Promise<void>;

  deleteByMessageIdAndUserIdAndEmoji(
    messageId: string,
    userId: string,
    emoji: string
  ): Promise<void>;
}
