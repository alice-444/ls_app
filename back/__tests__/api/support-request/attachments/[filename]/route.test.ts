import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";
import { createRequest, getJson } from "../../../helpers/request";
import { GET } from "@/app/api/support-request/attachments/[filename]/route";

vi.mock("@/lib/api-helpers", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/api-helpers")>();
  return {
    ...actual,
    getAuthenticatedSession: vi.fn(),
  };
});

const { getAuthenticatedSession } = await import("@/lib/api-helpers");

describe("GET /api/support-request/attachments/[filename]", () => {
  beforeEach(() => {
    vi.mocked(getAuthenticatedSession).mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    });
  });

  it("returns 401 when not authenticated", async () => {
    const req = createRequest("/api/support-request/attachments/abc.pdf");
    const res = await GET(req, {
      params: Promise.resolve({ filename: "abc.pdf" }),
    });
    expect(res.status).toBe(401);
    const data = await getJson<{ error?: string }>(res);
    expect(data.error).toBe("Unauthorized");
  });
});
