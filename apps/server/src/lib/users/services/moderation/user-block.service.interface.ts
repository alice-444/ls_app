import type { Result } from "../../../common";
import type { UserBlockEntity } from "../../repositories/user-block.repository.interface";

export interface IUserBlockService {
  blockUser(
    blockerUserId: string,
    blockedUserId: string
  ): Promise<Result<{ success: boolean }>>;
  unblockUser(
    blockerUserId: string,
    blockedUserId: string
  ): Promise<Result<{ success: boolean }>>;
  getBlockedUsers(blockerUserId: string): Promise<
    Result<
      Array<{
        userId: string;
        name: string | null;
        displayName: string | null;
        photoUrl: string | null;
        blockedAt: Date;
      }>
    >
  >;
  isUserBlocked(
    blockerUserId: string,
    blockedUserId: string
  ): Promise<Result<{ isBlocked: boolean }>>;
  checkIfBlocked(
    blockerUserId: string,
    blockedUserId: string
  ): Promise<Result<boolean>>;
  areUsersBlocked(
    userId1: string,
    userId2: string
  ): Promise<
    Result<{ user1BlockedUser2: boolean; user2BlockedUser1: boolean }>
  >;

  getAllBlockedAppUserIds(
    appUserId: string
  ): Promise<Result<{ blockedByUser: Set<string>; blockedUser: Set<string> }>>;
}
