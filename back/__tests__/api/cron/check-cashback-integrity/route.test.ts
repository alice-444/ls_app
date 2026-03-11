import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRequest, getJson } from "../../helpers/request";
import { GET } from "@/app/api/cron/check-cashback-integrity/route";

const mockCheckCashbackIntegrity = vi.fn();

vi.mock("@/lib/di/container", () => ({
  container: {
    maintenanceService: {
      checkCashbackIntegrity: () => mockCheckCashbackIntegrity(),
    },
  },
}));

describe("GET /api/cron/check-cashback-integrity", () => {
  const validToken = "test-cron-secret";

  beforeEach(() => {
    process.env.CRON_SECRET = validToken;
    mockCheckCashbackIntegrity.mockResolvedValue({ issues: 0 });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when x-cron-token is missing", async () => {
    const req = createRequest("/api/cron/check-cashback-integrity", {
      method: "GET",
    });
    const res = await GET(req);
    expect(res.status).toBe(401);
    const data = await getJson<{ error?: string }>(res);
    expect(data.error).toBe("Unauthorized");
    expect(mockCheckCashbackIntegrity).not.toHaveBeenCalled();
  });

  it("returns 401 when x-cron-token is wrong", async () => {
    const req = createRequest("/api/cron/check-cashback-integrity", {
      method: "GET",
      headers: { "x-cron-token": "wrong-token" },
    });
    const res = await GET(req);
    expect(res.status).toBe(401);
    expect(mockCheckCashbackIntegrity).not.toHaveBeenCalled();
  });

  it("returns 200 and success payload when authorized", async () => {
    const req = createRequest("/api/cron/check-cashback-integrity", {
      method: "GET",
      headers: { "x-cron-token": validToken },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await getJson<{
      issues?: number;
    }>(res);
    expect(data.issues).toBe(0);
    expect(mockCheckCashbackIntegrity).toHaveBeenCalled();
  });

  it("returns 500 when service throws an error", async () => {
    mockCheckCashbackIntegrity.mockRejectedValue(new Error("Service Error"));
    const req = createRequest("/api/cron/check-cashback-integrity", {
      method: "GET",
      headers: { "x-cron-token": validToken },
    });
    const res = await GET(req);
    expect(res.status).toBe(500);
    const data = await getJson<{ error?: string }>(res);
    expect(data.error).toBe("Internal server error");
  });
});
