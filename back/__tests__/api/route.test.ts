import { describe, it, expect } from "vitest";
import { getJson } from "./helpers/request";
import { GET } from "@/app/route";

describe("GET /", () => {
  it("returns 200 and { message: 'OK' }", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await getJson<{ message: string }>(res);
    expect(data).toEqual({ message: "OK" });
  });
});
