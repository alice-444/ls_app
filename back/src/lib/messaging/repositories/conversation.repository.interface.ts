export interface ConversationEntity {
  id: string;
  participant1Id: string;
  participant2Id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConversationRepository {
  findConversationBetweenUsers(
    appUserId1: string,
    appUserId2: string
  ): Promise<ConversationEntity | null>;

  findConversationBetweenUsersWithTransaction(
    appUserId1: string,
    appUserId2: string,
    tx: any
  ): Promise<ConversationEntity | null>;

  findById(conversationId: string): Promise<ConversationEntity | null>;

  findConversationsForUser(
    appUserId: string
  ): Promise<ConversationEntity[]>;

  create(data: {
    id: string;
    participant1Id: string;
    participant2Id: string;
    updatedAt: Date;
  }): Promise<ConversationEntity>;

  createWithTransaction(
    data: {
      id: string;
      participant1Id: string;
      participant2Id: string;
      updatedAt: Date;
    },
    tx: any
  ): Promise<ConversationEntity>;

  update(
    conversationId: string,
    data: { updatedAt: Date }
  ): Promise<ConversationEntity>;

  updateWithTransaction(
    conversationId: string,
    data: { updatedAt: Date },
    tx: any
  ): Promise<ConversationEntity>;

  delete(conversationId: string): Promise<void>;
}

