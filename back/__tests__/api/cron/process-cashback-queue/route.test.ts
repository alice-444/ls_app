import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRequest, getJson } from "../../helpers/request";
import { POST } from "@/app/api/cron/process-cashback-queue/route";

const mockProcessQueuedCashbacks = vi.fn();
const mockCheckDataIntegrity = vi.fn();
const mockRetryFailedCashbacks = vi.fn();

vi.mock("@/lib/di/container", () => ({
  container: {
    workshopCashbackService: {
      processQueuedCashbacks: () => mockProcessQueuedCashbacks(),
      checkDataIntegrity: () => mockCheckDataIntegrity(),
      retryFailedCashbacks: () => mockRetryFailedCashbacks(),
    },
  },
}));

describe("POST /api/cron/process-cashback-queue", () => {
  const validToken = "test-cron-secret";

  beforeEach(() => {
    process.env.CRON_SECRET = validToken;
    mockProcessQueuedCashbacks.mockResolvedValue({
      ok: true,
      data: { processed: 0, failed: 0 },
    });
    mockCheckDataIntegrity.mockResolvedValue({ ok: true, data: [] });
    mockRetryFailedCashbacks.mockResolvedValue({
      ok: true,
      data: { retried: 0, stillFailed: 0 },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when x-cron-token is missing", async () => {
    const req = createRequest("/api/cron/process-cashback-queue", {
      method: "POST",
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await getJson<{ error?: string }>(res);
    expect(data.error).toBe("Unauthorized");
    expect(mockProcessQueuedCashbacks).not.toHaveBeenCalled();
  });

  it("returns 401 when x-cron-token is wrong", async () => {
    const req = createRequest("/api/cron/process-cashback-queue", {
      method: "POST",
      headers: { "x-cron-token": "wrong-token" },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(mockProcessQueuedCashbacks).not.toHaveBeenCalled();
  });

  it("returns 200 and success payload when authorized", async () => {
    const req = createRequest("/api/cron/process-cashback-queue", {
      method: "POST",
      headers: { "x-cron-token": validToken },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await getJson<{
      success?: boolean;
      processed?: number;
      failed?: number;
      retried?: number;
      timestamp?: string;
    }>(res);
    expect(data.success).toBe(true);
    expect(data.processed).toBe(0);
    expect(data.failed).toBe(0);
    expect(data.retried).toBe(0);
    expect(data.timestamp).toBeDefined();
    expect(mockProcessQueuedCashbacks).toHaveBeenCalled();
  });
});
