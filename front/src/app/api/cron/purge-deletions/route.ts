import { NextRequest, NextResponse } from "next/server";
import { container } from "../../../../lib/di/container";
import { isCronAuthorized } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isCronAuthorized(req)) {
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

export async function POST(req: NextRequest) {
  return GET(req);
}
