import { describe, it, expect, vi, beforeEach } from "vitest";
import { 
  getMentorProfile, 
  getUserData, 
  getUserRole, 
  API_BASE_URL,
  authenticatedFetch 
} from "@/lib/api-client";

describe("api-client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn();
  });

  describe("authenticatedFetch", () => {
    it("calls fetch with correct headers and options", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      await authenticatedFetch("/api/test", { method: "POST" });

      expect(fetch).toHaveBeenCalledWith("/api/test", expect.objectContaining({
        method: "POST",
        credentials: "include",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      }));
    });
  });

  describe("getMentorProfile", () => {
    it("returns profile data on success", async () => {
      const mockProfile = { profile: { name: "John" }, isPublished: true };
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockProfile),
      } as Response);

      const result = await getMentorProfile();
      expect(result).toEqual(mockProfile);
      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/profile/role/mentor`, expect.any(Object));
    });

    it("throws error on failure", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        statusText: "Not Found",
      } as Response);

      await expect(getMentorProfile()).rejects.toThrow("Failed to load profile: Not Found");
    });
  });

  describe("getUserData", () => {
    it("returns role and status on success", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ role: "MENTOR", status: "ACTIVE" }),
      } as Response);

      const result = await getUserData();
      expect(result).toEqual({ role: "MENTOR", status: "ACTIVE" });
    });

    it("returns null on 401 Unauthorized", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 401,
      } as Response);

      const result = await getUserData();
      expect(result).toBeNull();
    });

    it("throws error on other failures", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Server Error",
      } as Response);

      await expect(getUserData()).rejects.toThrow("Failed to fetch user data: Server Error");
    });
  });

  describe("getUserRole", () => {
    it("returns role from getUserData", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ role: "ADMIN", status: "ACTIVE" }),
      } as Response);

      const role = await getUserRole();
      expect(role).toBe("ADMIN");
    });

    it("returns null if no data", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 401,
      } as Response);

      const role = await getUserRole();
      expect(role).toBeNull();
    });
  });
});
