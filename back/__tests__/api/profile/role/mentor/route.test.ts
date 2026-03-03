import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";
import { createRequest, getJson } from "../../../helpers/request";
import { GET, POST } from "@/app/api/profile/role/mentor/route";

vi.mock("@/lib/api-helpers", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/api-helpers")>();
  return {
    ...actual,
    getAuthenticatedSession: vi.fn(),
    applyRateLimit: vi.fn().mockResolvedValue({ ok: true }),
  };
});

const { getAuthenticatedSession } = await import("@/lib/api-helpers");

describe("GET /api/profile/role/mentor", () => {
  beforeEach(() => {
    vi.mocked(getAuthenticatedSession).mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    });
  });

  it("returns 401 when not authenticated", async () => {
    const req = createRequest("/api/profile/role/mentor");
    const res = await GET(req);
    expect(res.status).toBe(401);
    const data = await getJson<{ error?: string }>(res);
    expect(data.error).toBe("Unauthorized");
  });
});

describe("POST /api/profile/role/mentor", () => {
  beforeEach(() => {
    vi.mocked(getAuthenticatedSession).mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    });
  });

  it("returns 401 when not authenticated", async () => {
    const req = createRequest("/api/profile/role/mentor", {
      method: "POST",
      body: {},
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await getJson<{ error?: string }>(res);
    expect(data.error).toBe("Unauthorized");
  });
});
