import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRequest, getJson } from "../../helpers/request";
import { POST } from "@/app/api/cron/cleanup-inactive-rooms/route";

const mockFindPublished = vi.fn();

vi.mock("@/lib/di/container", () => ({
  container: {
    workshopRepository: {
      findPublished: () => mockFindPublished(),
      update: vi.fn(),
    },
    dailyService: {
      getRoomInfo: vi.fn(),
      deleteRoom: vi.fn(),
    },
  },
}));

describe("POST /api/cron/cleanup-inactive-rooms", () => {
  const validToken = "test-cron-secret";

  beforeEach(() => {
    process.env.CRON_SECRET = validToken;
    mockFindPublished.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when x-cron-token is missing", async () => {
    const req = createRequest("/api/cron/cleanup-inactive-rooms", {
      method: "POST",
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await getJson<{ error?: string }>(res);
    expect(data.error).toBe("Unauthorized");
    expect(mockFindPublished).not.toHaveBeenCalled();
  });

  it("returns 200 with processed/closed/errors when authorized", async () => {
    const req = createRequest("/api/cron/cleanup-inactive-rooms", {
      method: "POST",
      headers: { "x-cron-token": validToken },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await getJson<{
      processed?: number;
      closed?: number;
      errors?: number;
    }>(res);
    expect(data.processed).toBe(0);
    expect(data.closed).toBe(0);
    expect(data.errors).toBe(0);
    expect(mockFindPublished).toHaveBeenCalled();
  });
});
