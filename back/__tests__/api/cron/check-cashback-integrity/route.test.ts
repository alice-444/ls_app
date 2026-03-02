import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRequest, getJson } from "../../helpers/request";
import { POST } from "@/app/api/cron/check-cashback-integrity/route";

const mockCheckDataIntegrity = vi.fn();

vi.mock("@/lib/di/container", () => ({
  container: {
    workshopCashbackService: {
      checkDataIntegrity: () => mockCheckDataIntegrity(),
    },
  },
}));

describe("POST /api/cron/check-cashback-integrity", () => {
  const validToken = "test-cron-secret";

  beforeEach(() => {
    process.env.CRON_SECRET = validToken;
    mockCheckDataIntegrity.mockResolvedValue({ ok: true, data: [] });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when x-cron-token is missing", async () => {
    const req = createRequest("/api/cron/check-cashback-integrity", {
      method: "POST",
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await getJson<{ error?: string }>(res);
    expect(data.error).toBe("Unauthorized");
    expect(mockCheckDataIntegrity).not.toHaveBeenCalled();
  });

  it("returns 401 when x-cron-token is wrong", async () => {
    const req = createRequest("/api/cron/check-cashback-integrity", {
      method: "POST",
      headers: { "x-cron-token": "wrong" },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(mockCheckDataIntegrity).not.toHaveBeenCalled();
  });

  it("returns 200 with issueCount and issues when authorized", async () => {
    const req = createRequest("/api/cron/check-cashback-integrity", {
      method: "POST",
      headers: { "x-cron-token": validToken },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await getJson<{
      success?: boolean;
      issueCount?: number;
      issues?: unknown[];
      timestamp?: string;
    }>(res);
    expect(data.success).toBe(true);
    expect(data.issueCount).toBe(0);
    expect(data.issues).toEqual([]);
    expect(data.timestamp).toBeDefined();
    expect(mockCheckDataIntegrity).toHaveBeenCalled();
  });
});
