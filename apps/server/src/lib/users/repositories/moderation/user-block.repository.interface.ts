export interface UserBlockEntity {
  id: string;
  blockerId: string;
  blockedId: string;
  createdAt: Date;
}

export interface IUserBlockRepository {
  create(blockerId: string, blockedId: string): Promise<UserBlockEntity>;
  delete(blockerId: string, blockedId: string): Promise<void>;
  findBlock(
    blockerId: string,
    blockedId: string
  ): Promise<UserBlockEntity | null>;
  findBlocksByBlocker(blockerId: string): Promise<UserBlockEntity[]>;
  findBlocksByBlocked(blockedId: string): Promise<UserBlockEntity[]>;
  isBlocked(blockerId: string, blockedId: string): Promise<boolean>;
  findBlockedUserIds(blockerId: string): Promise<string[]>;
}
