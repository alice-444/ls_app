import type { Result } from "../../common";

export interface IUserConnectionService {
  sendConnectionRequest(
    requesterUserId: string,
    receiverUserId: string
  ): Promise<Result<{ success: boolean }>>;

  acceptConnectionRequest(
    userId: string,
    connectionId: string
  ): Promise<Result<{ success: boolean }>>;

  rejectConnectionRequest(
    userId: string,
    connectionId: string
  ): Promise<Result<{ success: boolean }>>;

  removeConnection(
    userId: string,
    otherUserId: string
  ): Promise<Result<{ success: boolean }>>;

  checkConnectionStatus(
    userId1: string,
    userId2: string
  ): Promise<Result<{ status: "PENDING" | "ACCEPTED" | "REJECTED" | null }>>;
}

