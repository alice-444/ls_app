import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";
import { createRequest, getJson } from "../../helpers/request";
import { DELETE } from "@/app/api/profile/delete/route";

vi.mock("@/lib/api-helpers", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/api-helpers")>();
  return {
    ...actual,
    getAuthenticatedSession: vi.fn(),
  };
});

const { getAuthenticatedSession } = await import("@/lib/api-helpers");

describe("DELETE /api/profile/delete", () => {
  beforeEach(() => {
    vi.mocked(getAuthenticatedSession).mockResolvedValue({
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    });
  });

  it("returns 401 when not authenticated", async () => {
    const req = createRequest("/api/profile/delete", { method: "DELETE" });
    const res = await DELETE(req);
    expect(res.status).toBe(401);
    const data = await getJson<{ error?: string }>(res);
    expect(data.error).toBe("Unauthorized");
  });
});
