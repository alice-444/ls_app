import { NextRequest, NextResponse } from "next/server";

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
    // Lazy load to avoid initialization at build time
    const { container } = await import("../../../../lib/di/container");
    const { logger } = await import("../../../../lib/common/logger");

    const result = await container.workshopCashbackService.processQueuedCashbacks();

    if (!result.ok) {
      logger.error("Error processing cashback queue", {
        error: result.error,
      });
      return NextResponse.json({ error: result.error }, { status: result.status || 500 });
    }

    const integrityCheck = await container.workshopCashbackService.checkDataIntegrity();
    if (integrityCheck.ok && integrityCheck.data.length > 0) {
      logger.warn("Data integrity issues detected after processing", {
        issueCount: integrityCheck.data.length,
      });
    }

    const retryResult = await container.workshopCashbackService.retryFailedCashbacks();
    if (retryResult.ok && retryResult.data.retried > 0) {
      logger.info("Retried failed cashbacks during queue processing", {
        retried: retryResult.data.retried,
        stillFailed: retryResult.data.stillFailed,
      });
    }

    return NextResponse.json({
      success: true,
      processed: result.data.processed,
      failed: result.data.failed,
      retried: retryResult.ok ? retryResult.data.retried : 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    const { logger } = await import("../../../../lib/common/logger");
    logger.error("Error in process-cashback-queue cron", error);
    return NextResponse.json({ error: "Internal server error", message: error.message }, { status: 500 });
  }
}
