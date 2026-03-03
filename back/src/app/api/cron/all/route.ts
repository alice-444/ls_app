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

  const results: Record<string, any> = {};

  try {
    results.purge = await container.maintenanceService.purgeScheduledDeletions();
    results.feedback = await container.maintenanceService.createFeedbackNotifications();
    results.videoLinks = await container.maintenanceService.generateVideoLinks();
    results.cleanupRooms = await container.maintenanceService.cleanupInactiveRooms();
    results.cashback = await container.maintenanceService.processCashbackMaintenance();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error: any) {
    console.error("Error in all-maintenance cron:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message, partialResults: results },
      { status: 500 }
    );
  }
}
