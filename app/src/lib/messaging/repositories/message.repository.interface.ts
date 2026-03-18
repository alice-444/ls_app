export interface MessageEntity {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  editCount: number;
  replyToMessageId: string | null;
  deletedAt: Date | null;
}

export interface IMessageRepository {
  findById(messageId: string): Promise<MessageEntity | null>;

  findMessagesForConversation(
    conversationId: string,
    limit?: number,
    offset?: number,
  ): Promise<MessageEntity[]>;

  findLastMessageForConversation(
    conversationId: string,
  ): Promise<MessageEntity | null>;

  countUnreadMessagesForUser(
    conversationId: string,
    userId: string,
  ): Promise<number>;

  create(
    data: {
      id: string;
      conversationId: string;
      senderId: string;
      content: string;
      replyToMessageId?: string | null;
    },
    tx?: any,
  ): Promise<MessageEntity>;

  searchMessages(
    userId: string,
    conversationId: string,
    query: string,
    limit?: number,
  ): Promise<MessageEntity[]>;

  markMessagesAsRead(conversationId: string, userId: string): Promise<string[]>;

  update(
    messageId: string,
    data: {
      content: string;
      updatedAt: Date;
      editCount: number;
    },
  ): Promise<MessageEntity>;

  delete(messageId: string): Promise<MessageEntity>;
}
