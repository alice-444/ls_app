import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRequest, getJson } from "../../helpers/request";
import { POST } from "@/app/api/cron/create-feedback-notifications/route";

vi.mock("@/lib/di/container", () => ({
  container: {
    prisma: {
      workshop: { findMany: vi.fn().mockResolvedValue([]) },
    },
  },
}));

describe("POST /api/cron/create-feedback-notifications", () => {
  const validToken = "test-cron-secret";

  beforeEach(() => {
    process.env.CRON_SECRET = validToken;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when x-cron-token is missing", async () => {
    const req = createRequest("/api/cron/create-feedback-notifications", {
      method: "POST",
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await getJson<{ error?: string }>(res);
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 200 with notificationsCreated when authorized", async () => {
    const req = createRequest("/api/cron/create-feedback-notifications", {
      method: "POST",
      headers: { "x-cron-token": validToken },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await getJson<{
      success?: boolean;
      notificationsCreated?: number;
      notificationsSkipped?: number;
      timestamp?: string;
    }>(res);
    expect(data.success).toBe(true);
    expect(data.notificationsCreated).toBeDefined();
    expect(data.notificationsSkipped).toBeDefined();
    expect(data.timestamp).toBeDefined();
  });
});
