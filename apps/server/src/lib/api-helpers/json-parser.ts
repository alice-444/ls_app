import { NextRequest, NextResponse } from "next/server";

export async function parseJsonBody(
  req: NextRequest
): Promise<
  { ok: true; body: unknown } | { ok: false; response: NextResponse }
> {
  try {
    const body = await req.json();
    return { ok: true, body };
  } catch (error) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      ),
    };
  }
}

export async function parseJsonBodySafe(req: NextRequest): Promise<unknown> {
  try {
    return await req.json();
  } catch (error) {
    if (!(error instanceof SyntaxError)) {
      console.error("Unexpected error parsing JSON body:", error);
    }
    return {};
  }
}
