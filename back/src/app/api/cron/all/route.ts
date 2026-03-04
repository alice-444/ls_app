import { NextRequest, NextResponse } from "next/server";
import { container } from "../../../../lib/di/container";
import { isCronAuthorized } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

async function runMaintenance() {
  const results: Record<string, any> = {};

  results.purge = await container.maintenanceService.purgeScheduledDeletions();
  results.feedback = await container.maintenanceService.createFeedbackNotifications();
  results.videoLinks = await container.maintenanceService.generateVideoLinks();
  results.cleanupRooms = await container.maintenanceService.cleanupInactiveRooms();
  results.cashback = await container.maintenanceService.processCashbackMaintenance();

  return results;
}

export async function GET(req: NextRequest) {
  if (!isCronAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await runMaintenance();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error: any) {
    console.error("Error in all-maintenance cron:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
