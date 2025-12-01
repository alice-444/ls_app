import type { Result } from "../../../common";

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

  getPendingRequestsReceived(userId: string): Promise<
    Result<
      Array<{
        connectionId: string;
        requesterUserId: string;
        requesterName: string | null;
        requesterDisplayName: string | null;
        requesterPhotoUrl: string | null;
        requesterRole: "MENTOR" | "APPRENANT" | "ADMIN" | null;
        requesterAppId: string;
        createdAt: Date;
      }>
    >
  >;

  getAcceptedConnections(userId: string): Promise<
    Result<
      Array<{
        connectionId: string;
        otherUserId: string;
        otherUserName: string | null;
        otherUserDisplayName: string | null;
        otherUserPhotoUrl: string | null;
        otherUserRole: "MENTOR" | "APPRENANT" | "ADMIN" | null;
        otherUserAppId: string;
        createdAt: Date;
        updatedAt: Date;
      }>
    >
  >;
}
