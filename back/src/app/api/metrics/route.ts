import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  // Metrics endpoint disabled for production build
  // TODO: Re-enable after resolving prom-client build-time issues
  return NextResponse.json({ error: "Metrics endpoint disabled" }, { status: 503 });
}
