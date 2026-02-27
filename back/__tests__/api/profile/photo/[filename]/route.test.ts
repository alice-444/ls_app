import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";
import { createRequest, getJson } from "../../../helpers/request";
import { GET } from "@/app/api/profile/photo/[filename]/route";

vi.mock("@/lib/api-helpers", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/api-helpers")>();
  return {
    ...actual,
    getAuthenticatedSession: vi.fn(),
  };
});

const { getAuthenticatedSession } = await import("@/lib/api-helpers");

describe("GET /api/profile/photo/[filename]", () => {
  beforeEach(() => {
    vi.mocked(getAuthenticatedSession).mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    });
  });

  it("returns 401 when not authenticated", async () => {
    const req = createRequest("/api/profile/photo/user-abc.jpg");
    const res = await GET(req, {
      params: Promise.resolve({ filename: "user-abc.jpg" }),
    });
    expect(res.status).toBe(401);
    const data = await getJson<{ error?: string }>(res);
    expect(data.error).toBe("Unauthorized");
  });

  it("returns error when filename format is invalid", async () => {
    vi.mocked(getAuthenticatedSession).mockResolvedValue({
      ok: true,
      session: {} as any,
      userId: "user-123",
    });
    const req = createRequest("/api/profile/photo/invalid");
    const res = await GET(req, {
      params: Promise.resolve({ filename: "invalid" }),
    });
    expect(res.status).toBeGreaterThanOrEqual(400);
    const data = await getJson<{ error?: string }>(res);
    expect(data.error).toBeDefined();
  });
});
