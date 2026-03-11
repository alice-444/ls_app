import { describe, it, expect, vi } from "vitest";
import { createRequest, getJson } from "../../../helpers/request";
import { GET } from "@/app/api/profile/photo/[filename]/route";

vi.mock("@/lib/api-helpers", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api-helpers")>();
  return {
    ...actual,
    getAuthenticatedSession: vi.fn(),
  };
});

const { getAuthenticatedSession } = await import("@/lib/api-helpers");

describe("GET /api/profile/photo/[filename]", () => {
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
