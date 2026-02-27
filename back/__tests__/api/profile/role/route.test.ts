import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";
import { createRequest, getJson } from "../../helpers/request";
import { GET } from "@/app/api/profile/role/route";

vi.mock("@/lib/api-helpers", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/api-helpers")>();
  return {
    ...actual,
    getAuthenticatedSession: vi.fn(),
  };
});

const { getAuthenticatedSession } = await import("@/lib/api-helpers");

describe("GET /api/profile/role", () => {
  beforeEach(() => {
    vi.mocked(getAuthenticatedSession).mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    });
  });

  it("returns 401 when not authenticated", async () => {
    const req = createRequest("/api/profile/role");
    const res = await GET(req);
    expect(res.status).toBe(401);
    const data = await getJson<{ error?: string }>(res);
    expect(data.error).toBe("Unauthorized");
  });
});
