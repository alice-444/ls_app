import type { IUserBlockService } from "./user-block.service.interface";
import type { IUserBlockRepository } from "../../repositories/moderation/user-block.repository.interface";
import type { AppUserRepository } from "../../repositories";
import type { IAuditLogService } from "../../../common/audit-log.service";
import { Result, success, failure } from "../../../common";
import { handleError, createErrorContext } from "../../../common/error-handler";
import { logger } from "../../../common/logger";
import { UserBlockCache } from "./user-block-cache";

export class UserBlockService implements IUserBlockService {
  private readonly cache: UserBlockCache;

  constructor(
    private readonly userBlockRepository: IUserBlockRepository,
    private readonly appUserRepository: AppUserRepository,
    private readonly auditLogService?: IAuditLogService,
    cacheTtlSeconds?: number
  ) {
    this.cache = new UserBlockCache(cacheTtlSeconds);
  }

  private async validateUsers(
    blockerUserId: string,
    blockedUserId: string
  ): Promise<
    Result<{
      blockerAppUser: NonNullable<
        Awaited<ReturnType<AppUserRepository["findByUserId"]>>
      >;
      blockedAppUser: NonNullable<
        Awaited<ReturnType<AppUserRepository["findByUserId"]>>
      >;
    }>
  > {
    if (blockerUserId === blockedUserId) {
      return failure("Cannot block yourself", 400);
    }

    const blockerAppUser = await this.appUserRepository.findByUserId(
      blockerUserId
    );
    if (!blockerAppUser) {
      return failure("Blocker user not found", 404);
    }

    const blockedAppUser = await this.appUserRepository.findByUserId(
      blockedUserId
    );
    if (!blockedAppUser) {
      return failure("Blocked user not found", 404);
    }

    return success({ blockerAppUser, blockedAppUser });
  }

  async blockUser(
    blockerUserId: string,
    blockedUserId: string
  ): Promise<Result<{ success: boolean }>> {
    try {
      const validationResult = await this.validateUsers(
        blockerUserId,
        blockedUserId
      );
      if (!validationResult.ok) {
        return validationResult;
      }

      const { blockerAppUser, blockedAppUser } = validationResult.data;

      const existingBlock = await this.userBlockRepository.findBlock(
        blockerAppUser.id,
        blockedAppUser.id
      );

      if (existingBlock) {
        logger.info("User already blocked", {
          blockerUserId,
          blockedUserId,
          blockId: existingBlock.id,
        });
        return success({ success: true });
      }

      const block = await this.userBlockRepository.create(
        blockerAppUser.id,
        blockedAppUser.id
      );

      this.cache.invalidate(blockerUserId, blockedUserId);

      logger.info("User blocked successfully", {
        blockerUserId,
        blockedUserId,
        blockId: block.id,
      });

      if (this.auditLogService) {
        await this.auditLogService.record(blockerUserId, "USER_BLOCKED", {
          blockedUserId,
          blockId: block.id,
          blockerAppUserId: blockerAppUser.id,
          blockedAppUserId: blockedAppUser.id,
        });
      }

      return success({ success: true });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("blockUser", {
          userId: blockerUserId,
          details: { blockedUserId },
        })
      );
    }
  }

  async unblockUser(
    blockerUserId: string,
    blockedUserId: string
  ): Promise<Result<{ success: boolean }>> {
    try {
      const validationResult = await this.validateUsers(
        blockerUserId,
        blockedUserId
      );
      if (!validationResult.ok) {
        return validationResult;
      }

      const { blockerAppUser, blockedAppUser } = validationResult.data;

      await this.userBlockRepository.delete(
        blockerAppUser.id,
        blockedAppUser.id
      );

      this.cache.invalidate(blockerUserId, blockedUserId);

      logger.info("User unblocked successfully", {
        blockerUserId,
        blockedUserId,
      });

      if (this.auditLogService) {
        await this.auditLogService.record(blockerUserId, "USER_UNBLOCKED", {
          blockedUserId,
          blockerAppUserId: blockerAppUser.id,
          blockedAppUserId: blockedAppUser.id,
        });
      }

      return success({ success: true });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("unblockUser", {
          userId: blockerUserId,
          details: { blockedUserId },
        })
      );
    }
  }

  async getBlockedUsers(blockerUserId: string): Promise<
    Result<
      Array<{
        userId: string;
        name: string | null;
        displayName: string | null;
        photoUrl: string | null;
        blockedAt: Date;
      }>
    >
  > {
    try {
      const blockerAppUser = await this.appUserRepository.findByUserId(
        blockerUserId
      );
      if (!blockerAppUser) {
        return failure("User not found", 404);
      }

      const blocks = await this.userBlockRepository.findBlocksByBlocker(
        blockerAppUser.id
      );

      const blockedUsers = await Promise.all(
        blocks.map(async (block) => {
          const blockedAppUser = await this.appUserRepository.findByAppUserId(
            block.blockedId
          );
          if (!blockedAppUser) {
            return null;
          }

          const [userName, identityCard] = await Promise.all([
            this.appUserRepository.findUserNameByUserId(blockedAppUser.userId),
            this.appUserRepository.findIdentityCardByUserId(
              blockedAppUser.userId
            ),
          ]);

          return {
            userId: blockedAppUser.userId,
            name: userName,
            displayName: identityCard?.displayName || null,
            photoUrl: identityCard?.photoUrl || null,
            blockedAt: block.createdAt,
          };
        })
      );

      const validBlockedUsers = blockedUsers.filter(
        (user) => user !== null
      ) as Array<{
        userId: string;
        name: string | null;
        displayName: string | null;
        photoUrl: string | null;
        blockedAt: Date;
      }>;

      return success(validBlockedUsers);
    } catch (error) {
      if (error instanceof Error) {
        logger.error("getBlockedUsers error details", error, {
          operation: "getBlockedUsers",
          userId: blockerUserId,
          errorName: error.name,
          errorMessage: error.message,
          errorStack: error.stack,
        });
      } else {
        logger.error("getBlockedUsers error (non-Error)", error, {
          operation: "getBlockedUsers",
          userId: blockerUserId,
          errorType: typeof error,
          errorString: String(error),
        });
      }

      return handleError(
        error,
        createErrorContext("getBlockedUsers", {
          userId: blockerUserId,
        })
      );
    }
  }

  async isUserBlocked(
    blockerUserId: string,
    blockedUserId: string
  ): Promise<Result<{ isBlocked: boolean }>> {
    try {
      const result = await this.checkIfBlocked(blockerUserId, blockedUserId);
      if (!result.ok) {
        return result;
      }
      return success({ isBlocked: result.data });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("isUserBlocked", {
          userId: blockerUserId,
          details: { blockedUserId },
        })
      );
    }
  }

  async checkIfBlocked(
    blockerUserId: string,
    blockedUserId: string
  ): Promise<Result<boolean>> {
    try {
      const cachedValue = this.cache.get(blockerUserId, blockedUserId);
      if (cachedValue !== null) {
        logger.debug("Block check result retrieved from cache", {
          blockerUserId,
          blockedUserId,
          isBlocked: cachedValue,
        });
        return success(cachedValue);
      }

      const blockerAppUser = await this.appUserRepository.findByUserId(
        blockerUserId
      );
      if (!blockerAppUser) {
        return failure("Blocker user not found", 404);
      }

      const blockedAppUser = await this.appUserRepository.findByUserId(
        blockedUserId
      );
      if (!blockedAppUser) {
        return failure("Blocked user not found", 404);
      }

      const isBlocked = await this.userBlockRepository.isBlocked(
        blockerAppUser.id,
        blockedAppUser.id
      );

      this.cache.set(blockerUserId, blockedUserId, isBlocked);

      return success(isBlocked);
    } catch (error) {
      return handleError(
        error,
        createErrorContext("checkIfBlocked", {
          userId: blockerUserId,
          details: { blockedUserId },
        })
      );
    }
  }

  async areUsersBlocked(
    userId1: string,
    userId2: string
  ): Promise<
    Result<{ user1BlockedUser2: boolean; user2BlockedUser1: boolean }>
  > {
    try {
      const [result1, result2] = await Promise.all([
        this.checkIfBlocked(userId1, userId2),
        this.checkIfBlocked(userId2, userId1),
      ]);

      if (!result1.ok) {
        return result1;
      }
      if (!result2.ok) {
        return result2;
      }

      return success({
        user1BlockedUser2: result1.data,
        user2BlockedUser1: result2.data,
      });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("areUsersBlocked", {
          details: { userId1, userId2 },
        })
      );
    }
  }

  async getAllBlockedAppUserIds(
    userId: string
  ): Promise<Result<{ blockedByUser: Set<string>; blockedUser: Set<string> }>> {
    try {
      const [blocksByBlocker, blocksByBlocked] = await Promise.all([
        this.userBlockRepository.findBlocksByBlocker(userId),
        this.userBlockRepository.findBlocksByBlocked(userId),
      ]);

      const blockedByUser = new Set<string>(
        blocksByBlocker.map((block) => block.blockedId)
      );
      const blockedUser = new Set<string>(
        blocksByBlocked.map((block) => block.blockerId)
      );

      return success({
        blockedByUser,
        blockedUser,
      });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("getAllBlockedAppUserIds", {
          resourceId: userId,
        })
      );
    }
  }
}
