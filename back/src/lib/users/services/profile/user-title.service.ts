import type { IUserTitleService } from "./user-title.service.interface";
import type { Result } from "../../../common";
import { success, failure } from "../../../common";
import { logger } from "../../../common/logger";
import type { PrismaClient } from "../../../../../prisma/generated/client/client";

export class UserTitleService implements IUserTitleService {
  private readonly TITLE_THRESHOLDS = {
    EXPLORER: { min: 0, max: 5, title: "Explorer" },
    CHALLENGER: { min: 6, max: 10, title: "Challenger" },
    ACHIEVER: { min: 11, max: 20, title: "Achiever" },
    VISIONARY: { min: 21, max: Infinity, title: "Visionary" },
  };

  constructor(private readonly prisma: PrismaClient) {}

  getTitleForCount(count: number): string {
    if (count >= this.TITLE_THRESHOLDS.VISIONARY.min) {
      return this.TITLE_THRESHOLDS.VISIONARY.title;
    }
    if (
      count >= this.TITLE_THRESHOLDS.ACHIEVER.min &&
      count <= this.TITLE_THRESHOLDS.ACHIEVER.max
    ) {
      return this.TITLE_THRESHOLDS.ACHIEVER.title;
    }
    if (
      count >= this.TITLE_THRESHOLDS.CHALLENGER.min &&
      count <= this.TITLE_THRESHOLDS.CHALLENGER.max
    ) {
      return this.TITLE_THRESHOLDS.CHALLENGER.title;
    }
    return this.TITLE_THRESHOLDS.EXPLORER.title;
  }

  async updateTitleBasedOnWorkshops(userId: string): Promise<
    Result<{
      newTitle: string;
      previousTitle: string | null;
      titleChanged: boolean;
    }>
  > {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { title: true },
      });

      if (!user) {
        return failure("User not found", 404);
      }

      const previousTitle = user.title || "Explorer";

      const appUser = await (this.prisma as any).app_user.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!appUser) {
        return failure("App user not found", 404);
      }

      const presentWorkshopsCount = await (this.prisma as any).workshop.count({
        where: {
          apprenticeId: appUser.id,
          apprenticeAttendanceStatus: "PRESENT",
        },
      });

      const newTitle = this.getTitleForCount(presentWorkshopsCount);
      const titleChanged = previousTitle !== newTitle;

      if (titleChanged) {
        await this.prisma.user.update({
          where: { id: userId },
          data: { title: newTitle },
        });

        logger.info("User title updated", {
          userId,
          previousTitle,
          newTitle,
          presentWorkshopsCount,
        });
      }

      return success({
        newTitle,
        previousTitle,
        titleChanged,
      });
    } catch (error) {
      logger.error("Error updating user title", error, { userId });
      return failure(
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour du titre",
        500
      );
    }
  }
}
