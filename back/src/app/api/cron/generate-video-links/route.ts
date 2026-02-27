import { NextRequest, NextResponse } from "next/server";
import { container } from "../../../../lib/di/container";

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

    const eligibleWorkshops =
      await container.workshopVideoLinkService.findWorkshopsEligibleForLinkGeneration();

    let generatedCount = 0;
    let errorCount = 0;
    const errors: Array<{ workshopId: string; error: string }> = [];

    for (const workshop of eligibleWorkshops) {
      try {
        const roomResult =
          await container.dailyService.getOrCreateRoomForWorkshop(
            workshop.id,
            workshop.title
          );

        if (roomResult.ok) {
          await container.workshopRepository.update(workshop.id, {
            dailyRoomId: roomResult.data.roomId,
          });

          generatedCount++;
          console.log(
            `Generated video link for workshop ${workshop.id} (${workshop.title})`
          );
        } else {
          errorCount++;
          errors.push({
            workshopId: workshop.id,
            error: roomResult.error,
          });
          console.error(
            `Failed to generate room for workshop ${workshop.id}:`,
            roomResult.error
          );
        }
      } catch (error: any) {
        errorCount++;
        errors.push({
          workshopId: workshop.id,
          error: error.message || "Unknown error",
        });
        console.error(
          `Error processing workshop ${workshop.id}:`,
          error.message
        );
      }
    }

    return NextResponse.json({
      processed: eligibleWorkshops.length,
      generated: generatedCount,
      errors: errorCount,
      errorDetails: errors,
    });
  } catch (error: any) {
    console.error("Error in generate-video-links cron:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
