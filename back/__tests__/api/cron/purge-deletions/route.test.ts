import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRequest, getJson } from "../../helpers/request";
import { POST } from "@/app/api/cron/purge-deletions/route";

const mockFindMany = vi.fn();

vi.mock("../../../../../prisma", () => ({
  default: {
    deletionJob: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      update: vi.fn(),
    },
    $transaction: vi.fn((fn: (tx: unknown) => Promise<unknown>) => fn({})),
    session: { deleteMany: vi.fn() },
    account: { deleteMany: vi.fn() },
    app_user: { deleteMany: vi.fn() },
    user: { update: vi.fn() },
  },
}));

describe("POST /api/cron/purge-deletions", () => {
  const validToken = "test-cron-secret";

  beforeEach(() => {
    process.env.CRON_SECRET = validToken;
    mockFindMany.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when x-cron-token is missing", async () => {
    const req = createRequest("/api/cron/purge-deletions", {
      method: "POST",
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await getJson<{ error?: string }>(res);
    expect(data.error).toBe("Unauthorized");
    expect(mockFindMany).not.toHaveBeenCalled();
  });

  it("returns 401 when x-cron-token is wrong", async () => {
    const req = createRequest("/api/cron/purge-deletions", {
      method: "POST",
      headers: { "x-cron-token": "wrong" },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(mockFindMany).not.toHaveBeenCalled();
  });
});
