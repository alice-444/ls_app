import type { PrismaClient } from '@/lib/prisma-server';
import { failure, success, Result } from "@/lib/common/types";
import { IUserTitleService, UserTitleUpdateResult } from "./user-title.service.interface";

export type UserTitle = "Explorer" | "Challenger" | "Achiever" | "Visionary";

export class UserTitleService implements IUserTitleService {
  constructor(private readonly prisma: PrismaClient) {}

  async updateTitleBasedOnWorkshops(
    userId: string
  ): Promise<Result<UserTitleUpdateResult>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { userId },
        select: { id: true, title: true },
      });

      if (!user) {
        return failure("App user not found", 404);
      }

      const workshopCount = await this.prisma.workshop.count({
        where: {
          apprenticeId: user.id,
          apprenticeAttendanceStatus: "PRESENT",
        },
      });

      const newTitle = this.getTitleForCount(workshopCount);
      const previousTitle = (user.title as UserTitle) || "Explorer";

      if (newTitle !== previousTitle) {
        await this.prisma.user.update({
          where: { userId },
          data: { title: newTitle },
        });

        return success({
          previousTitle,
          newTitle,
          titleChanged: true,
          workshopCount,
        });
      }

      return success({
        previousTitle,
        newTitle,
        titleChanged: false,
        workshopCount,
      });
    } catch (error) {
      return failure("DB error", 500);
    }
  }

  public getTitleForCount(workshopCount: number): UserTitle {
    if (workshopCount >= 21) return "Visionary";
    if (workshopCount >= 11) return "Achiever";
    if (workshopCount >= 6) return "Challenger";
    return "Explorer";
  }
}
