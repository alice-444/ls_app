export interface UserConnectionEntity {
  id: string;
  requesterId: string;
  receiverId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserConnectionRepository {
  findConnectionBetweenUsers(
    appUserId1: string,
    appUserId2: string
  ): Promise<UserConnectionEntity | null>;

  findById(connectionId: string): Promise<UserConnectionEntity | null>;

  create(data: {
    id: string;
    requesterId: string;
    receiverId: string;
    status: "PENDING";
    updatedAt: Date;
  }): Promise<UserConnectionEntity>;

  update(
    connectionId: string,
    data: {
      status?: "PENDING" | "ACCEPTED" | "REJECTED";
      updatedAt: Date;
    }
  ): Promise<UserConnectionEntity>;

  delete(connectionId: string): Promise<void>;

  findPendingRequestsReceivedBy(
    appUserId: string
  ): Promise<UserConnectionEntity[]>;

  findAcceptedConnectionsFor(
    appUserId: string
  ): Promise<UserConnectionEntity[]>;

  findPendingRequestsSentBy(
    appUserId: string
  ): Promise<UserConnectionEntity[]>;
}

