import type { PrismaClient } from '@/lib/prisma';
import { IMaintenanceService } from "./maintenance.service.interface";
import { logger } from "../../common/logger";
import { generateInternalId } from "../../utils/id-generator";
import type { ServicesContainer } from "../../di/services.container";

export class MaintenanceService implements IMaintenanceService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly services: ServicesContainer
  ) {}

  async purgeScheduledDeletions(): Promise<{ processed: number; errors: number }> {
    const now = new Date();
    const result = { processed: 0, errors: 0 };

    const dueJobs = await (this.prisma as any).deletion_job.findMany({
      where: {
        runAt: { lte: now },
        status: "PENDING",
      },
      take: 100,
    });

    for (const job of dueJobs) {
      try {
        await this.prisma.$transaction(async (tx) => {
          await tx.user.update({
            where: { userId: job.userId },
            data: {
              name: "Utilisateur supprimé",
              email: `deleted-${job.userId}@learnsup.fr`,
              displayName: "Anonyme",
              photoUrl: null,
              bio: null,
              qualifications: null,
              experience: null,
              calendlyLink: null,
              status: "DELETED",
              deletedAt: now,
            },
          });

          await (tx as any).deletion_job.update({
            where: { id: job.id },
            data: { status: "COMPLETED" },
          });
        });
        result.processed++;
      } catch (error) {
        logger.error(`Failed to process deletion job ${job.id}`, error);
        await (this.prisma as any).deletion_job.update({
          where: { id: job.id },
          data: { status: "ERROR" },
        });
        result.errors++;
      }
    }

    return result;
  }

  async createFeedbackNotifications(): Promise<{
    created: number;
    skipped: number;
    timestamp: string;
  }> {
    const now = new Date();
    const result = { created: 0, skipped: 0, timestamp: now.toISOString() };

    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const workshops = await this.prisma.workshop.findMany({
      where: {
        date: {
          lte: oneHourAgo,
          gte: twentyFourHoursAgo,
        },
        apprenticeId: { not: null },
        apprenticeAttendanceStatus: "PRESENT",
        mentorFeedbacks: {
          none: {},
        },
      },
      include: {
        creator: true,
      },
    });

    for (const workshop of workshops) {
      if (!workshop.apprenticeId) continue;

      const existing = await this.prisma.notification.findFirst({
        where: {
          userId: workshop.apprenticeId,
          type: "WORKSHOP_FEEDBACK_REQUEST",
          actionUrl: `/workshop/${workshop.id}/feedback`,
        },
      });

      if (existing) {
        result.skipped++;
        continue;
      }

      await this.prisma.notification.create({
        data: {
          id: generateInternalId(),
          userId: workshop.apprenticeId,
          senderId: workshop.creatorId,
          type: "WORKSHOP_FEEDBACK_REQUEST",
          title: "Comment s'est passé votre atelier ?",
          message: `L'atelier "${workshop.title}" est terminé. Prenez un moment pour laisser un avis à ${workshop.creator.displayName || workshop.creator.name}.`,
          actionUrl: `/workshop/${workshop.id}/feedback`,
        },
      });
      result.created++;
    }

    return result;
  }

  async generateVideoLinks(): Promise<{
    processed: number;
    generated: number;
    errors: number;
  }> {
    const eligibleWorkshops =
      await this.services.workshopVideoLinkService.findWorkshopsEligibleForLinkGeneration();

    let generatedCount = 0;
    let errorCount = 0;

    for (const workshop of eligibleWorkshops) {
      try {
        const roomResult =
          await this.services.dailyService.getOrCreateRoomForWorkshop(
            workshop.id,
            workshop.title
          );

        if (roomResult.ok) {
          await this.prisma.workshop.update({
            where: { id: workshop.id },
            data: { dailyRoomId: roomResult.data.roomId },
          });
          generatedCount++;
        } else {
          errorCount++;
          logger.error(`Failed to generate room for workshop ${workshop.id}: ${roomResult.error}`);
        }
      } catch (error: any) {
        errorCount++;
        logger.error(`Error processing workshop ${workshop.id}: ${error.message}`);
      }
    }

    return {
      processed: eligibleWorkshops.length,
      generated: generatedCount,
      errors: errorCount,
    };
  }

  async cleanupInactiveRooms(): Promise<{
    processed: number;
    closed: number;
    errors: number;
  }> {
    const now = new Date();
    const inactivityThreshold = 30 * 60 * 1000;
    const cutoffTime = new Date(now.getTime() - inactivityThreshold);

    const workshops = await this.prisma.workshop.findMany({
      where: {
        dailyRoomId: { not: null },
        status: "PUBLISHED",
      },
    });

    const eligibleWorkshops = workshops.filter((workshop) => {
      const lastActivity = (workshop as any).dailyRoomLastActivityAt || workshop.createdAt;
      return lastActivity < cutoffTime;
    });

    let closedCount = 0;
    let errorCount = 0;

    for (const workshop of eligibleWorkshops) {
      if (!workshop.dailyRoomId) continue;

      try {
        const roomInfo = await this.services.dailyService.getRoomInfo(
          workshop.dailyRoomId
        );

        if (roomInfo.ok && roomInfo.data) {
          const participantCount = roomInfo.data.participantCount || 0;
          if (participantCount === 0) {
            const deleteResult = await this.services.dailyService.deleteRoom(
              workshop.dailyRoomId
            );

            if (deleteResult.ok) {
              await this.prisma.workshop.update({
                where: { id: workshop.id },
                data: {
                  dailyRoomId: null,
                  dailyRoomLastActivityAt: null,
                } as any,
              });
              closedCount++;
            } else {
              errorCount++;
            }
          } else {
            await this.prisma.workshop.update({
              where: { id: workshop.id },
              data: { dailyRoomLastActivityAt: now } as any,
            });
          }
        }
      } catch (error: any) {
        errorCount++;
        logger.error(`Error cleaning up room for workshop ${workshop.id}: ${error.message}`);
      }
    }

    return {
      processed: eligibleWorkshops.length,
      closed: closedCount,
      errors: errorCount,
    };
  }

  async processCashbackMaintenance(): Promise<{
    processed: number;
    failed: number;
    retried: number;
    integrityIssues: number;
  }> {
    // 1. Process queue
    const queueResult = await this.services.workshopCashbackService.processQueuedCashbacks();
    
    // 2. Retry failed
    const retryResult = await this.services.workshopCashbackService.retryFailedCashbacks();
    
    // 3. Check integrity
    const integrityCheck = await this.services.workshopCashbackService.checkDataIntegrity();

    return {
      processed: queueResult.ok ? queueResult.data.processed : 0,
      failed: queueResult.ok ? queueResult.data.failed : 0,
      retried: retryResult.ok ? retryResult.data.retried : 0,
      integrityIssues: integrityCheck.ok ? integrityCheck.data.length : 0,
    };
  }
}
