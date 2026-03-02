import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/metrics/route";

describe("GET /api/metrics", () => {
  it("returns 200 with Prometheus content-type", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const contentType = res.headers.get("Content-Type");
    expect(contentType).toBeDefined();
    expect(
      contentType?.includes("text/plain") || contentType?.includes("text/plain;")
    ).toBe(true);
    const text = await res.text();
    expect(text.length).toBeGreaterThan(0);
    expect(text).toContain("http_request_duration_seconds"); // default metric name from our register
  });
});
