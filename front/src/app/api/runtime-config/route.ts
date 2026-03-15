import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return NextResponse.json({
    socketUrl: process.env.RUNTIME_SOCKET_URL || null,
  });
}
