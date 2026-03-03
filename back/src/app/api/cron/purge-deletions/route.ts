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
    const result = await container.maintenanceService.purgeScheduledDeletions();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in purge-deletions cron:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
