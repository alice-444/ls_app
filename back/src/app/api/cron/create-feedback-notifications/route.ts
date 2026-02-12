import { NextRequest, NextResponse } from "next/server";
import { container } from "../../../../lib/di/container";
import { logger } from "../../../../lib/common/logger";
import type { PrismaClient } from "../../../../../prisma/generated/client/client";

export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest): boolean {
  const token = req.headers.get("x-cron-token");
  return !!token && token === process.env.CRON_SECRET;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const prisma = container.prisma as PrismaClient;
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const workshops = await (prisma as any).workshop.findMany({
      where: {
        status: "COMPLETED",
        apprenticeAttendanceStatus: "PRESENT",
        apprenticeId: { not: null },
        date: { not: null },
        time: { not: null },
      },
      include: {
        app_user_workshop_apprenticeIdToapp_user: {
          include: {
            user: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    let notificationsCreated = 0;
    let notificationsSkipped = 0;

    for (const workshop of workshops) {
      if (!workshop.date || !workshop.time || !workshop.apprenticeId) continue;

      const workshopDate = new Date(workshop.date);
      const [hours, minutes] = workshop.time.split(":").map(Number);
      const startTime = new Date(workshopDate);
      startTime.setHours(hours, minutes, 0, 0);
      const endTime = new Date(startTime);
      if (workshop.duration) {
        endTime.setMinutes(endTime.getMinutes() + workshop.duration);
      } else {
        endTime.setHours(endTime.getHours() + 1);
      }

      if (endTime > oneHourAgo) continue;

      const apprenticeUserId = workshop.app_user_workshop_apprenticeIdToapp_user?.user?.id;
      if (!apprenticeUserId) continue;

      const existingFeedback = await (prisma as any).mentor_feedback.findFirst({
        where: {
          workshopId: workshop.id,
          apprenticeId: workshop.apprenticeId,
        },
      });

      if (existingFeedback) {
        notificationsSkipped++;
        continue;
      }

      const existingNotification = await (prisma as any).notification.findFirst({
        where: {
          userId: apprenticeUserId,
          type: "feedback_request",
          actionUrl: `/workshop/${workshop.id}`,
          isRead: false,
        },
      });

      if (existingNotification) {
        notificationsSkipped++;
        continue;
      }

      try {
        await container.notificationService.createNotification(apprenticeUserId, {
          type: "feedback_request",
          title: "Partagez votre avis",
          message: `Comment s'est passé l'atelier "${workshop.title}" ? Soumettez votre avis et gagnez 1 crédit !`,
          actionUrl: `/workshop/${workshop.id}`,
        });
        notificationsCreated++;
      } catch (error) {
        logger.error("Error creating feedback notification", error, {
          workshopId: workshop.id,
          userId: apprenticeUserId,
        });
      }
    }

    return NextResponse.json({
      success: true,
      notificationsCreated,
      notificationsSkipped,
      timestamp: now.toISOString(),
    });
  } catch (error: any) {
    logger.error("Error in create-feedback-notifications cron", error);
    return NextResponse.json({ error: "Internal server error", message: error.message }, { status: 500 });
  }
}
