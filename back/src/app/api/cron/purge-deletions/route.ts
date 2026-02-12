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

  // Lazy load to avoid initialization at build time
  const prisma = await import("../../../../../prisma");

  const now = new Date();
  const due = await (prisma.default as any).deletionJob.findMany({
    where: { runAt: { lte: now }, status: "PENDING" },
    take: 100,
  });
  for (const job of due) {
    try {
      await (prisma.default.$transaction as any)(async (tx: any) => {
        await tx.session.deleteMany({ where: { userId: job.userId } });
        await tx.account.deleteMany({ where: { userId: job.userId } });
        await tx.app_user.deleteMany({ where: { userId: job.userId } });
        await tx.user.update({
          where: { id: job.userId },
          data: {
            email: `${job.userId}@deleted.local`,
            name: "Deleted User",
            username: `deleted_${job.userId.slice(0, 8)}`,
            displayUsername: null,
            image: null,
            isDisabled: true,
            deletedAt: now,
            updatedAt: now,
          },
        });
        await tx.deletionJob.update({
          where: { id: job.id },
          data: { status: "DONE", updatedAt: now },
        });
      });
    } catch (e) {
      await (prisma.default as any).deletionJob.update({
        where: { id: job.id },
        data: { status: "ERROR" },
      });
    }
  }
  return NextResponse.json({ processed: due.length });
}
