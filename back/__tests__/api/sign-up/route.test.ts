import { describe, it, expect } from "vitest";
import { createRequest, getJson } from "../helpers/request";
import { POST } from "@/app/api/sign-up/route";

describe("POST /api/sign-up", () => {
  it("returns 400 when body is empty", async () => {
    const req = createRequest("/api/sign-up", {
      method: "POST",
      body: {},
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await getJson<{ error?: string }>(res);
    expect(data.error).toBeDefined();
  });

  it("returns 400 when email is invalid", async () => {
    const req = createRequest("/api/sign-up", {
      method: "POST",
      body: { email: "bad", name: "Test", password: "password123" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await getJson<{ error?: string }>(res);
    expect(data.error).toBeDefined();
  });
});
