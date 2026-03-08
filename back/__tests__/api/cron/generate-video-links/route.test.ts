import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRequest, getJson } from "../../helpers/request";
import { POST } from "@/app/api/cron/generate-video-links/route";

const mockGenerateVideoLinks = vi.fn();

vi.mock("@/lib/di/container", () => ({
  container: {
    maintenanceService: {
      generateVideoLinks: () => mockGenerateVideoLinks(),
    },
  },
}));

describe("POST /api/cron/generate-video-links", () => {
  const validToken = "test-cron-secret";

  beforeEach(() => {
    process.env.CRON_SECRET = validToken;
    mockGenerateVideoLinks.mockResolvedValue({ processed: 0, generated: 0, errors: 0 });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when x-cron-token is missing", async () => {
    const req = createRequest("/api/cron/generate-video-links", {
      method: "POST",
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await getJson<{ error?: string }>(res);
    expect(data.error).toBe("Unauthorized");
    expect(mockGenerateVideoLinks).not.toHaveBeenCalled();
  });

  it("returns 200 with processed/generated when authorized", async () => {
    const req = createRequest("/api/cron/generate-video-links", {
      method: "POST",
      headers: { "x-cron-token": validToken },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await getJson<{
      processed?: number;
      generated?: number;
      errors?: number;
    }>(res);
    expect(data.processed).toBe(0);
    expect(data.generated).toBe(0);
    expect(data.errors).toBe(0);
    expect(mockGenerateVideoLinks).toHaveBeenCalled();
  });
});
