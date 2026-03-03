import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRequest, getJson } from "../../helpers/request";
import { POST } from "@/app/api/cron/process-cashback-queue/route";

const mockProcessCashbackMaintenance = vi.fn();

vi.mock("@/lib/di/container", () => ({
  container: {
    maintenanceService: {
      processCashbackMaintenance: () => mockProcessCashbackMaintenance(),
    },
  },
}));

describe("POST /api/cron/process-cashback-queue", () => {
  const validToken = "test-cron-secret";

  beforeEach(() => {
    process.env.CRON_SECRET = validToken;
    mockProcessCashbackMaintenance.mockResolvedValue({ processed: 0, failed: 0, retried: 0, integrityIssues: 0 });
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
    expect(mockProcessCashbackMaintenance).not.toHaveBeenCalled();
  });

  it("returns 401 when x-cron-token is wrong", async () => {
    const req = createRequest("/api/cron/process-cashback-queue", {
      method: "POST",
      headers: { "x-cron-token": "wrong-token" },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(mockProcessCashbackMaintenance).not.toHaveBeenCalled();
  });

  it("returns 200 and success payload when authorized", async () => {
    const req = createRequest("/api/cron/process-cashback-queue", {
      method: "POST",
      headers: { "x-cron-token": validToken },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await getJson<{
      processed?: number;
    }>(res);
    expect(data.processed).toBe(0);
    expect(mockProcessCashbackMaintenance).toHaveBeenCalled();
  });
});
