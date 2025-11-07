import { NextResponse } from "next/server";

export function handleRouteError(error: unknown): NextResponse {
  const errorMessage =
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : error instanceof Error
      ? error.message
      : "Internal server error";

  return NextResponse.json({ error: errorMessage }, { status: 500 });
}
