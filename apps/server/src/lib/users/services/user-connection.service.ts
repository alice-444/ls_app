import { Result, failure, success } from "../../common";
import { generateInternalId } from "../../utils/id-generator";
import type { AppUserRepository } from "../repositories";
import type { IUserConnectionRepository } from "../repositories/user-connection.repository.interface";
import { verifyUserExists } from "../../auth/services/user-helpers";
import type { IUserConnectionService } from "./user-connection.service.interface";

export class UserConnectionService implements IUserConnectionService {
  constructor(
    private readonly appUserRepository: AppUserRepository,
    private readonly userConnectionRepository: IUserConnectionRepository
  ) {}

  async sendConnectionRequest(
    requesterUserId: string,
    receiverUserId: string
  ): Promise<Result<{ success: boolean }>> {
    try {
      if (requesterUserId === receiverUserId) {
        return failure("Cannot send connection request to yourself", 400);
      }

      const requesterCheck = await verifyUserExists(requesterUserId);
      if (!requesterCheck.ok) {
        return requesterCheck;
      }

      const receiverCheck = await verifyUserExists(receiverUserId);
      if (!receiverCheck.ok) {
        return receiverCheck;
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

      return success({ success: true });
    } catch (error) {
      return failure((error as Error).message, 500);
    }
  }

  async acceptConnectionRequest(
    userId: string,
    connectionId: string
  ): Promise<Result<{ success: boolean }>> {
    try {
      const userCheck = await verifyUserExists(userId);
      if (!userCheck.ok) {
        return userCheck;
      }

      const appUser = await this.appUserRepository.findByUserId(userId);
      if (!appUser) {
        return failure("User not found", 404);
      }

      const connection =
        await this.userConnectionRepository.findById(connectionId);

      if (!connection) {
        return failure("Connection request not found", 404);
      }

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
        status: "ACCEPTED",
        updatedAt: new Date(),
      });

      return success({ success: true });
    } catch (error) {
      return failure((error as Error).message, 500);
    }
  }

  async rejectConnectionRequest(
    userId: string,
    connectionId: string
  ): Promise<Result<{ success: boolean }>> {
    try {
      const userCheck = await verifyUserExists(userId);
      if (!userCheck.ok) {
        return userCheck;
      }

      const appUser = await this.appUserRepository.findByUserId(userId);
      if (!appUser) {
        return failure("User not found", 404);
      }

      const connection =
        await this.userConnectionRepository.findById(connectionId);

      if (!connection) {
        return failure("Connection request not found", 404);
      }

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
      return failure((error as Error).message, 500);
    }
  }

  async removeConnection(
    userId: string,
    otherUserId: string
  ): Promise<Result<{ success: boolean }>> {
    try {
      const userCheck = await verifyUserExists(userId);
      if (!userCheck.ok) {
        return userCheck;
      }

      const appUser = await this.appUserRepository.findByUserId(userId);
      const otherAppUser = await this.appUserRepository.findByUserId(
        otherUserId
      );

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
      return failure((error as Error).message, 500);
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
      return failure((error as Error).message, 500);
    }
  }
}
