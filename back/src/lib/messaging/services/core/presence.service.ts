import type { AppUserRepository } from "../../../users/repositories";
import { prisma } from "../../../common";

export interface UserPresence {
  userId: string;
  isOnline: boolean;
  lastSeen: Date | null;
}

export class PresenceService {
  constructor(private readonly appUserRepository: AppUserRepository) {}

  async updateUserPresence(userId: string, isOnline: boolean): Promise<void> {
    const appUser = await this.appUserRepository.findByUserId(userId);
    if (!appUser) {
      return;
    }

    await prisma.user.update({
      where: { id: appUser.id },
      data: {
        isOnline,
        lastSeen: isOnline ? new Date() : undefined,
      },
    });
  }

  async getUserPresence(userId: string): Promise<UserPresence | null> {
    const appUser = await this.appUserRepository.findByUserId(userId);
    if (!appUser) {
      return null;
    }

    const fullAppUser = await prisma.user.findUnique({
      where: { id: appUser.id },
      select: {
        userId: true,
        isOnline: true,
        lastSeen: true,
      },
    });

    if (!fullAppUser) {
      return null;
    }

    return {
      userId: fullAppUser.userId,
      isOnline: fullAppUser.isOnline || false,
      lastSeen: fullAppUser.lastSeen || null,
    };
  }

  async getMultipleUsersPresence(
    userIds: string[]
  ): Promise<Map<string, UserPresence>> {
    const appUsers = await Promise.all(
      userIds.map((userId) => this.appUserRepository.findByUserId(userId))
    );

    const presenceMap = new Map<string, UserPresence>();

    for (const appUser of appUsers) {
      if (appUser) {
        const fullAppUser = await prisma.user.findUnique({
          where: { id: appUser.id },
          select: {
            userId: true,
            isOnline: true,
            lastSeen: true,
          },
        });

        if (fullAppUser) {
          presenceMap.set(fullAppUser.userId, {
            userId: fullAppUser.userId,
            isOnline: fullAppUser.isOnline || false,
            lastSeen: fullAppUser.lastSeen || null,
          });
        }
      }
    }

    return presenceMap;
  }
}
