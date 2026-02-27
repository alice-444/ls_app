import { NextRequest, NextResponse } from "next/server";
import { container } from "../../../../lib/di/container";
import { logger } from "../../../../lib/common/logger";

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
    const result =
      await container.workshopCashbackService.retryFailedCashbacks();

    if (!result.ok) {
      logger.error("Failed to retry failed cashbacks", {
        error: result.error,
      });
      return NextResponse.json(
        { error: result.error },
        { status: result.status || 500 }
      );
    }

    logger.info("Retry failed cashbacks completed", {
      retried: result.data.retried,
      stillFailed: result.data.stillFailed,
    });

    return NextResponse.json({
      success: true,
      retried: result.data.retried,
      stillFailed: result.data.stillFailed,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error("Error in retry-failed-cashbacks cron", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
