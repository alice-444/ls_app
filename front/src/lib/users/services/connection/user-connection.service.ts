import { Result, failure, success } from "../../../common";
import { handleError, createErrorContext } from "../../../common/error-handler";
import { generateInternalId } from "../../../utils/id-generator";
import type { AppUserRepository } from "../../repositories";
import type { IUserConnectionRepository } from "../../repositories/connection/user-connection.repository.interface";
import { verifyUserExists } from "../../../auth/services/user-helpers";
import type { IUserConnectionService } from "./user-connection.service.interface";
import type { IUserBlockService } from "../moderation/user-block.service.interface";
import type { INotificationService } from "../../../notifications/services/notification.service.interface";
import { UserInfoEnricher } from "./user-info-enricher";
import { logger } from "../../../common/logger";

export class UserConnectionService implements IUserConnectionService {
  private readonly enricher: UserInfoEnricher;

  constructor(
    private readonly appUserRepository: AppUserRepository,
    private readonly userConnectionRepository: IUserConnectionRepository,
    private readonly userBlockService: IUserBlockService,
    private readonly notificationService: INotificationService
  ) {
    this.enricher = new UserInfoEnricher(appUserRepository);
  }

  async sendConnectionRequest(
    requesterUserId: string,
    receiverUserId: string
  ): Promise<Result<{ success: boolean }>> {
    try {
      if (requesterUserId === receiverUserId) {
        return failure("Cannot send connection request to yourself", 400);
      }

      const requesterCheck = await verifyUserExists(requesterUserId);
      if (!requesterCheck.ok) return requesterCheck;

      const receiverCheck = await verifyUserExists(receiverUserId);
      if (!receiverCheck.ok) return receiverCheck;

      // Check for blocks
      const blockResult = await this.userBlockService.areUsersBlocked(
        requesterUserId,
        receiverUserId
      );
      if (!blockResult.ok) return blockResult;
      if (blockResult.data.user1BlockedUser2 || blockResult.data.user2BlockedUser1) {
        return failure("Cannot send connection request to this user", 403);
      }

      const requesterAppUser = await this.appUserRepository.findByUserId(
        requesterUserId
      );
      const receiverAppUser = await this.appUserRepository.findByUserId(
        receiverUserId
      );

      if (!requesterAppUser || !receiverAppUser) {
        return failure("One or both users not found", 404);
      }

      const existingConnection =
        await this.userConnectionRepository.findConnectionBetweenUsers(
          requesterAppUser.id,
          receiverAppUser.id
        );

      if (existingConnection) {
        if (existingConnection.status === "ACCEPTED") {
          return failure("Users are already connected", 400);
        }
        if (existingConnection.status === "PENDING") {
          return failure("Connection request already pending", 400);
        }
      }

      await this.userConnectionRepository.create({
        id: generateInternalId(),
        requesterId: requesterAppUser.id,
        receiverId: receiverAppUser.id,
        status: "PENDING",
        updatedAt: new Date(),
      });

      // Trigger notification for the receiver
      const requesterName = requesterAppUser.displayName || requesterAppUser.name || "Un utilisateur";
      await this.notificationService.createNotification(
        receiverUserId,
        {
          type: "social",
          title: "Nouvelle demande de connexion",
          message: `${requesterName} souhaite rejoindre votre réseau.`,
          actionUrl: "/network",
        },
        requesterUserId
      );

      return success({ success: true });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("sendConnectionRequest", {
          userId: requesterUserId,
          details: { receiverUserId },
        })
      );
    }
  }

  async acceptConnectionRequest(
    userId: string,
    connectionId: string
  ): Promise<Result<{ success: boolean }>> {
    try {
      const userCheck = await verifyUserExists(userId);
      if (!userCheck.ok) return userCheck;

      const appUser = await this.appUserRepository.findByUserId(userId);
      if (!appUser) return failure("User not found", 404);

      const connection = await this.userConnectionRepository.findById(connectionId);
      if (!connection) return failure("Connection request not found", 404);

      if (connection.receiverId !== appUser.id) {
        return failure(
          "You are not the receiver of this connection request",
          403
        );
      }

      if (connection.status !== "PENDING") {
        return failure("Connection request is not pending", 400);
      }

      // Check for blocks before accepting
      const requesterAppUser = await this.appUserRepository.findByAppUserId(connection.requesterId);
      if (requesterAppUser) {
        const blockResult = await this.userBlockService.areUsersBlocked(
          userId,
          requesterAppUser.userId
        );
        if (blockResult.ok && (blockResult.data.user1BlockedUser2 || blockResult.data.user2BlockedUser1)) {
          return failure("Cannot accept request from this user", 403);
        }
      }

      await this.userConnectionRepository.update(connectionId, {
        status: "ACCEPTED",
        updatedAt: new Date(),
      });

      // Notify the requester
      if (requesterAppUser) {
        const accepterName = appUser.displayName || appUser.name || "Un utilisateur";
        await this.notificationService.createNotification(
          requesterAppUser.userId,
          {
            type: "social",
            title: "Demande de connexion acceptée",
            message: `${accepterName} a accepté votre demande de connexion.`,
            actionUrl: "/network",
          },
          userId
        );
      }

      return success({ success: true });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("acceptConnectionRequest", {
          userId,
          resourceId: connectionId,
        })
      );
    }
  }

  async rejectConnectionRequest(
    userId: string,
    connectionId: string
  ): Promise<Result<{ success: boolean }>> {
    try {
      const userCheck = await verifyUserExists(userId);
      if (!userCheck.ok) return userCheck;

      const appUser = await this.appUserRepository.findByUserId(userId);
      if (!appUser) return failure("User not found", 404);

      const connection = await this.userConnectionRepository.findById(connectionId);
      if (!connection) return failure("Connection request not found", 404);

      if (connection.receiverId !== appUser.id) {
        return failure(
          "You are not the receiver of this connection request",
          403
        );
      }

      if (connection.status !== "PENDING") {
        return failure("Connection request is not pending", 400);
      }

      await this.userConnectionRepository.update(connectionId, {
        status: "REJECTED",
        updatedAt: new Date(),
      });

      return success({ success: true });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("rejectConnectionRequest", {
          userId,
          resourceId: connectionId,
        })
      );
    }
  }

  async removeConnection(
    userId: string,
    otherUserId: string
  ): Promise<Result<{ success: boolean }>> {
    try {
      const userCheck = await verifyUserExists(userId);
      if (!userCheck.ok) return userCheck;

      const appUser = await this.appUserRepository.findByUserId(userId);
      const otherAppUser = await this.appUserRepository.findByUserId(otherUserId);

      if (!appUser || !otherAppUser) {
        return failure("One or both users not found", 404);
      }

      const connection =
        await this.userConnectionRepository.findConnectionBetweenUsers(
          appUser.id,
          otherAppUser.id
        );

      if (!connection || connection.status !== "ACCEPTED") {
        return failure("Connection not found", 404);
      }

      await this.userConnectionRepository.delete(connection.id);

      return success({ success: true });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("removeConnection", {
          userId,
          details: { otherUserId },
        })
      );
    }
  }

  async checkConnectionStatus(
    userId1: string,
    userId2: string
  ): Promise<Result<{ status: "PENDING" | "ACCEPTED" | "REJECTED" | null }>> {
    try {
      const appUser1 = await this.appUserRepository.findByUserId(userId1);
      const appUser2 = await this.appUserRepository.findByUserId(userId2);

      if (!appUser1 || !appUser2) {
        return failure("One or both users not found", 404);
      }

      const connection =
        await this.userConnectionRepository.findConnectionBetweenUsers(
          appUser1.id,
          appUser2.id
        );

      return success({
        status: connection?.status || null,
      });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("checkConnectionStatus", {
          userId: userId1,
          details: { userId2 },
        })
      );
    }
  }

  async getPendingRequestsReceived(userId: string): Promise<
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
  > {
    try {
      const appUser = await this.appUserRepository.findByUserId(userId);
      if (!appUser) return failure("User not found", 404);

      const blockedAppUserIds = await this.getBlockedAppUserIds(appUser.id);

      const connections =
        await this.userConnectionRepository.findPendingRequestsReceivedBy(
          appUser.id
        );

      const requestsWithUserInfo = await Promise.all(
        connections.map(async (connection) => {
          if (blockedAppUserIds.has(connection.requesterId)) return null;

          const info = await this.enricher.enrichByAppUserId(connection.requesterId);
          if (!info) return null;

          return {
            connectionId: connection.id,
            requesterUserId: info.userId,
            requesterName: info.name,
            requesterDisplayName: info.displayName,
            requesterPhotoUrl: info.photoUrl,
            requesterRole: info.role,
            requesterAppId: info.appId,
            createdAt: connection.createdAt,
          };
        })
      );

      return success(
        requestsWithUserInfo.filter(
          (req): req is NonNullable<typeof req> => req !== null
        )
      );
    } catch (error) {
      return handleError(
        error,
        createErrorContext("getPendingRequestsReceived", { userId })
      );
    }
  }

  async getAcceptedConnections(userId: string): Promise<
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
  > {
    try {
      const appUser = await this.appUserRepository.findByUserId(userId);
      if (!appUser) return failure("User not found", 404);

      const blockedAppUserIds = await this.getBlockedAppUserIds(appUser.id);

      const connections =
        await this.userConnectionRepository.findAcceptedConnectionsFor(
          appUser.id
        );

      const connectionsWithUserInfo = await Promise.all(
        connections.map(async (connection) => {
          const otherAppUserId =
            connection.requesterId === appUser.id
              ? connection.receiverId
              : connection.requesterId;

          if (blockedAppUserIds.has(otherAppUserId)) return null;

          const info = await this.enricher.enrichByAppUserId(otherAppUserId);
          if (!info) return null;

          return {
            connectionId: connection.id,
            otherUserId: info.userId,
            otherUserName: info.name,
            otherUserDisplayName: info.displayName,
            otherUserPhotoUrl: info.photoUrl,
            otherUserRole: info.role,
            otherUserAppId: info.appId,
            createdAt: connection.createdAt,
            updatedAt: connection.updatedAt,
          };
        })
      );

      return success(
        connectionsWithUserInfo.filter(
          (conn): conn is NonNullable<typeof conn> => conn !== null
        )
      );
    } catch (error) {
      return handleError(
        error,
        createErrorContext("getAcceptedConnections", { userId })
      );
    }
  }

  async getPendingRequestsSent(userId: string): Promise<
    Result<
      Array<{
        connectionId: string;
        receiverUserId: string;
        receiverName: string | null;
        receiverDisplayName: string | null;
        receiverPhotoUrl: string | null;
        receiverRole: "MENTOR" | "APPRENANT" | "ADMIN" | null;
        receiverAppId: string;
        createdAt: Date;
      }>
    >
  > {
    try {
      const appUser = await this.appUserRepository.findByUserId(userId);
      if (!appUser) return failure("User not found", 404);

      const blockedAppUserIds = await this.getBlockedAppUserIds(appUser.id);

      const connections =
        await this.userConnectionRepository.findPendingRequestsSentBy(
          appUser.id
        );

      const requestsWithUserInfo = await Promise.all(
        connections.map(async (connection) => {
          if (blockedAppUserIds.has(connection.receiverId)) return null;

          const info = await this.enricher.enrichByAppUserId(connection.receiverId);
          if (!info) return null;

          return {
            connectionId: connection.id,
            receiverUserId: info.userId,
            receiverName: info.name,
            receiverDisplayName: info.displayName,
            receiverPhotoUrl: info.photoUrl,
            receiverRole: info.role,
            receiverAppId: info.appId,
            createdAt: connection.createdAt,
          };
        })
      );

      return success(
        requestsWithUserInfo.filter(
          (req): req is NonNullable<typeof req> => req !== null
        )
      );
    } catch (error) {
      return handleError(
        error,
        createErrorContext("getPendingRequestsSent", { userId })
      );
    }
  }

  private async getBlockedAppUserIds(appUserId: string): Promise<Set<string>> {
    const blockedAppUserIds = new Set<string>();
    const blockedUsersResult =
      await this.userBlockService.getAllBlockedAppUserIds(appUserId);

    if (blockedUsersResult.ok) {
      blockedUsersResult.data.blockedByUser.forEach((id) =>
        blockedAppUserIds.add(id)
      );
      blockedUsersResult.data.blockedUser.forEach((id) =>
        blockedAppUserIds.add(id)
      );
    } else {
      logger.warn("Error loading blocked users for connection filtering", {
        userId: appUserId,
        error: blockedUsersResult.error,
      });
    }
    return blockedAppUserIds;
  }
}
