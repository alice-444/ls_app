import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRequest, getJson } from "../../helpers/request";
import { POST } from "@/app/api/cron/cleanup-inactive-rooms/route";

const mockCleanupInactiveRooms = vi.fn();

vi.mock("@/lib/di/container", () => ({
  container: {
    maintenanceService: {
      cleanupInactiveRooms: () => mockCleanupInactiveRooms(),
    },
  },
}));

describe("POST /api/cron/cleanup-inactive-rooms", () => {
  const validToken = "test-cron-secret";

  beforeEach(() => {
    process.env.CRON_SECRET = validToken;
    mockCleanupInactiveRooms.mockResolvedValue({ processed: 0, closed: 0, errors: 0 });
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
    expect(mockCleanupInactiveRooms).not.toHaveBeenCalled();
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
    expect(mockCleanupInactiveRooms).toHaveBeenCalled();
  });
});
