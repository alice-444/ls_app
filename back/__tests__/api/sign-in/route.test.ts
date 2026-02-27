import { describe, it, expect } from "vitest";
import { createRequest, getJson } from "../helpers/request";
import { POST } from "@/app/api/sign-in/route";

describe("POST /api/sign-in", () => {
  it("returns 400 when body is empty", async () => {
    const req = createRequest("/api/sign-in", {
      method: "POST",
      body: {},
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await getJson<{ error?: string }>(res);
    expect(data.error).toBeDefined();
  });

  it("returns 400 when email is invalid", async () => {
    const req = createRequest("/api/sign-in", {
      method: "POST",
      body: { email: "not-an-email", password: "12345678" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await getJson<{ error?: string }>(res);
    expect(data.error).toBeDefined();
  });

  it("returns 400 when password is too short", async () => {
    const req = createRequest("/api/sign-in", {
      method: "POST",
      body: { email: "user@example.com", password: "short" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await getJson<{ error?: string }>(res);
    expect(data.error).toBeDefined();
  });
});
