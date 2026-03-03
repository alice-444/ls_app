import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRequest, getJson } from "../../helpers/request";
import { POST } from "@/app/api/cron/create-feedback-notifications/route";

const mockCreateFeedbackNotifications = vi.fn();

vi.mock("@/lib/di/container", () => ({
  container: {
    maintenanceService: {
      createFeedbackNotifications: () => mockCreateFeedbackNotifications(),
    },
  },
}));

describe("POST /api/cron/create-feedback-notifications", () => {
  const validToken = "test-cron-secret";

  beforeEach(() => {
    process.env.CRON_SECRET = validToken;
    mockCreateFeedbackNotifications.mockResolvedValue({ created: 0, skipped: 0, timestamp: new Date().toISOString() });
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
    expect(mockCreateFeedbackNotifications).not.toHaveBeenCalled();
  });

  it("returns 200 with notificationsCreated when authorized", async () => {
    const req = createRequest("/api/cron/create-feedback-notifications", {
      method: "POST",
      headers: { "x-cron-token": validToken },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await getJson<{
      created?: number;
      skipped?: number;
    }>(res);
    expect(data.created).toBe(0);
    expect(mockCreateFeedbackNotifications).toHaveBeenCalled();
  });
});
