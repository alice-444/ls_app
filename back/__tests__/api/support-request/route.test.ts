import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";
import { createRequest, getJson } from "../helpers/request";
import { POST } from "@/app/api/support-request/route";

vi.mock("@/lib/api-helpers", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/api-helpers")>();
  return {
    ...actual,
    getAuthenticatedSession: vi.fn().mockResolvedValue({ ok: false }),
    applyRateLimit: vi.fn().mockResolvedValue({ ok: true }),
  };
});

describe("POST /api/support-request", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when formData is missing or invalid", async () => {
    const req = createRequest("/api/support-request", {
      method: "POST",
      body: {},
    });
    const res = await POST(req);
    expect(res.status).toBeGreaterThanOrEqual(400);
    const data = await getJson<{ error?: string }>(res);
    expect(data.error).toBeDefined();
  });
});
