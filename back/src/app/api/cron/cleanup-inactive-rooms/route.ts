import { NextRequest, NextResponse } from "next/server";
import { container } from "../../../../lib/di/container";

function isAuthorized(req: NextRequest): boolean {
  const token = req.headers.get("x-cron-token");
  return !!token && token === process.env.CRON_SECRET;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const inactivityThreshold = 30 * 60 * 1000;
    const cutoffTime = new Date(now.getTime() - inactivityThreshold);

    const allPublishedWorkshops =
      await container.workshopRepository.findPublished();

    const workshops = allPublishedWorkshops.filter((workshop) => {
      if (!workshop.dailyRoomId) return false;

      const lastActivity =
        workshop.dailyRoomLastActivityAt || workshop.createdAt;
      return lastActivity < cutoffTime;
    });

    let closedCount = 0;
    let errorCount = 0;

    for (const workshop of workshops) {
      if (!workshop.dailyRoomId) continue;

      try {
        const roomInfo = await container.dailyService.getRoomInfo(
          workshop.dailyRoomId
        );

        if (roomInfo.ok && roomInfo.data) {
          const participantCount = roomInfo.data.participantCount || 0;
          if (participantCount === 0) {
            const deleteResult = await container.dailyService.deleteRoom(
              workshop.dailyRoomId
            );

            if (deleteResult.ok) {
              await container.workshopRepository.update(workshop.id, {
                dailyRoomId: null,
                dailyRoomLastActivityAt: null,
              });

              closedCount++;
              console.log(
                `Closed inactive room for workshop ${workshop.id} (${workshop.title})`
              );
            } else {
              errorCount++;
              console.error(
                `Failed to delete room ${workshop.dailyRoomId}:`,
                deleteResult.error
              );
            }
          } else {
            await container.workshopRepository.update(workshop.id, {
              dailyRoomLastActivityAt: now,
            });
          }
        }
      } catch (error: any) {
        errorCount++;
        console.error(
          `Error processing workshop ${workshop.id}:`,
          error.message
        );
      }
    }

    return NextResponse.json({
      processed: workshops.length,
      closed: closedCount,
      errors: errorCount,
    });
  } catch (error: any) {
    console.error("Error in cleanup-inactive-rooms cron:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
