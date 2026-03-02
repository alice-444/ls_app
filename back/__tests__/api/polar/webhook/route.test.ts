import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRequest, getJson } from "../../helpers/request";
import { POST } from "@/app/api/polar/webhook/route";

describe("POST /api/polar/webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when signature header is missing", async () => {
    const req = createRequest("/api/polar/webhook", {
      method: "POST",
      body: "{}",
      headers: {},
    });
    req.headers.delete("Content-Type");
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await getJson<{ error?: string }>(res);
    expect(data.error).toBe("Missing webhook signature header");
  });
});
