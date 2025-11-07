import { NextResponse } from "next/server";
import type { Result } from "@/lib/common";

export function handleServiceResult<T>(result: Result<T>): NextResponse {
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status ?? 400 }
    );
  }

  return NextResponse.json(result.data);
}
