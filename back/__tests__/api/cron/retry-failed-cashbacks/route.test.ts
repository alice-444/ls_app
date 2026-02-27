import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRequest, getJson } from "../../helpers/request";
import { POST } from "@/app/api/cron/retry-failed-cashbacks/route";

const mockRetryFailedCashbacks = vi.fn();

vi.mock("@/lib/di/container", () => ({
  container: {
    workshopCashbackService: {
      retryFailedCashbacks: () => mockRetryFailedCashbacks(),
    },
  },
}));

describe("POST /api/cron/retry-failed-cashbacks", () => {
  const validToken = "test-cron-secret";

  beforeEach(() => {
    process.env.CRON_SECRET = validToken;
    mockRetryFailedCashbacks.mockResolvedValue({
      ok: true,
      data: { retried: 0, stillFailed: 0 },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when x-cron-token is missing", async () => {
    const req = createRequest("/api/cron/retry-failed-cashbacks", {
      method: "POST",
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await getJson<{ error?: string }>(res);
    expect(data.error).toBe("Unauthorized");
    expect(mockRetryFailedCashbacks).not.toHaveBeenCalled();
  });

  it("returns 200 with retried/stillFailed when authorized", async () => {
    const req = createRequest("/api/cron/retry-failed-cashbacks", {
      method: "POST",
      headers: { "x-cron-token": validToken },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await getJson<{
      success?: boolean;
      retried?: number;
      stillFailed?: number;
      timestamp?: string;
    }>(res);
    expect(data.success).toBe(true);
    expect(data.retried).toBe(0);
    expect(data.stillFailed).toBe(0);
    expect(data.timestamp).toBeDefined();
    expect(mockRetryFailedCashbacks).toHaveBeenCalled();
  });
});
