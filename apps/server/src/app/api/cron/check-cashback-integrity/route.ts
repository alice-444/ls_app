import { NextRequest, NextResponse } from "next/server";
import { container } from "../../../../lib/di/container";
import { logger } from "../../../../lib/common/logger";

function isAuthorized(req: NextRequest): boolean {
  const token = req.headers.get("x-cron-token");
  return !!token && token === process.env.CRON_SECRET;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await container.workshopCashbackService.checkDataIntegrity();

    if (!result.ok) {
      logger.error("Error checking cashback data integrity", {
        error: result.error,
      });
      return NextResponse.json(
        { error: result.error },
        { status: result.status || 500 }
      );
    }

    const issues = result.data;

    if (issues.length > 0) {
      logger.warn("Cashback data integrity issues detected", {
        issueCount: issues.length,
        issues: issues.map((issue) => ({
          transactionId: issue.transactionId,
          workshopId: issue.workshopId,
          issue: issue.issue,
        })),
      });

      // TODO: Envoyer une alerte (email, Slack, etc.)
      // await sendAlert({ type: "cashback_integrity", issues });
    }

    return NextResponse.json({
      success: true,
      issueCount: issues.length,
      issues: issues,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error("Error in check-cashback-integrity cron", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
