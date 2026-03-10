import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRequest, getJson } from "../../helpers/request";
import { GET } from "@/app/api/cron/retry-failed-cashbacks/route";

const mockRetryFailedCashbacks = vi.fn();

vi.mock("@/lib/di/container", () => ({
  container: {
    maintenanceService: {
      retryFailedCashbacks: () => mockRetryFailedCashbacks(),
    },
  },
}));

describe("GET /api/cron/retry-failed-cashbacks", () => {
  const validToken = "test-cron-secret";

  beforeEach(() => {
    process.env.CRON_SECRET = validToken;
    mockRetryFailedCashbacks.mockResolvedValue({ retried: 0, errors: 0 });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when x-cron-token is missing", async () => {
    const req = createRequest("/api/cron/retry-failed-cashbacks", {
      method: "GET",
    });
    const res = await GET(req);
    expect(res.status).toBe(401);
    const data = await getJson<{ error?: string }>(res);
    expect(data.error).toBe("Unauthorized");
    expect(mockRetryFailedCashbacks).not.toHaveBeenCalled();
  });

  it("returns 401 when x-cron-token is wrong", async () => {
    const req = createRequest("/api/cron/retry-failed-cashbacks", {
      method: "GET",
      headers: { "x-cron-token": "wrong-token" },
    });
    const res = await GET(req);
    expect(res.status).toBe(401);
    expect(mockRetryFailedCashbacks).not.toHaveBeenCalled();
  });

  it("returns 200 and success payload when authorized", async () => {
    const req = createRequest("/api/cron/retry-failed-cashbacks", {
      method: "GET",
      headers: { "x-cron-token": validToken },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await getJson<{
      retried?: number;
      errors?: number;
    }>(res);
    expect(data.retried).toBe(0);
    expect(data.errors).toBe(0);
    expect(mockRetryFailedCashbacks).toHaveBeenCalled();
  });

  it("returns 500 when service throws an error", async () => {
    mockRetryFailedCashbacks.mockRejectedValue(new Error("Service Error"));
    const req = createRequest("/api/cron/retry-failed-cashbacks", {
      method: "GET",
      headers: { "x-cron-token": validToken },
    });
    const res = await GET(req);
    expect(res.status).toBe(500);
    const data = await getJson<{ error?: string }>(res);
    expect(data.error).toBe("Internal server error");
  });
});
