import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRequest, getJson } from "../../helpers/request";
import { POST } from "@/app/api/daily/webhook/route";

vi.mock("@/lib/di/container", () => ({
  container: {
    workshopRepository: { update: vi.fn() },
  },
}));

describe("POST /api/daily/webhook", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  it("returns 401 when DAILY_WEBHOOK_SECRET is set and signature is missing", async () => {
    process.env.DAILY_WEBHOOK_SECRET = "test-secret";
    (process.env as any).NODE_ENV = "production";
    const req = createRequest("/api/daily/webhook", {
      method: "POST",
      body: JSON.stringify({ type: "participant-joined" }),
      headers: {},
    });
    req.headers.delete("x-daily-signature");
    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await getJson<{ error?: string }>(res);
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 200 when body is valid event in development without secret", async () => {
    process.env.DAILY_WEBHOOK_SECRET = "";
    (process.env as any).NODE_ENV = "development";
    const req = createRequest("/api/daily/webhook", {
      method: "POST",
      body: JSON.stringify({
        type: "participant-joined",
        room: { name: "workshop-abc" },
        participants: [],
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await getJson<{ ok?: boolean }>(res);
    expect(data.ok).toBe(true);
  });
});
