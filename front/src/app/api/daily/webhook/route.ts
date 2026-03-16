import { NextRequest, NextResponse } from "next/server";
import { container } from "../../../../lib/di/container";
import crypto from "crypto";

function isAuthorized(req: NextRequest, body: string): boolean {
  const webhookSecret = process.env.DAILY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "⚠️ DAILY_WEBHOOK_SECRET not configured - webhook validation disabled"
      );
      return true;
    }
    return false;
  }

  const signature = req.headers.get("x-daily-signature");
  if (!signature) {
    return false;
  }

  const hmac = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(hmac));
}

export async function POST(req: NextRequest) {
  const body = await req.text();

  if (!isAuthorized(req, body)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const event = JSON.parse(body);

    if (
      event.type === "participant-joined" ||
      event.type === "participant-left"
    ) {
      const roomName = event.room?.name || event.room_name;

      if (!roomName) {
        return NextResponse.json(
          { error: "Missing room name" },
          { status: 400 }
        );
      }

      const workshopIdMatch = roomName.match(/^workshop-(.+)$/);
      if (!workshopIdMatch) {
        return NextResponse.json({ ok: true, message: "Not a workshop room" });
      }

      const workshopId = workshopIdMatch[1];

      const participantCount = event.participants?.length || 0;

      if (participantCount > 0) {
        await container.workshopRepository.update(workshopId, {
          dailyRoomLastActivityAt: new Date(),
        });
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true, message: "Event type not handled" });
  } catch (error: any) {
    console.error("Error processing Daily.co webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
