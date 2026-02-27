import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserInfoEnricher } from "../../../../../../src/lib/users/services/connection/user-info-enricher";

describe("UserInfoEnricher", () => {
  const mockAppUserRepo = {
    findByAppUserId: vi.fn(),
    findUserNameByUserId: vi.fn(),
    findIdentityCardByUserId: vi.fn(),
  };

  let enricher: UserInfoEnricher;

  beforeEach(() => {
    vi.clearAllMocks();
    enricher = new UserInfoEnricher(mockAppUserRepo as any);
  });

  describe("enrichByAppUserId", () => {
    it("returns null when appUser not found", async () => {
      mockAppUserRepo.findByAppUserId.mockResolvedValue(null);

      const result = await enricher.enrichByAppUserId("app-unknown");
      expect(result).toBeNull();
    });

    it("returns enriched user info with all fields", async () => {
      mockAppUserRepo.findByAppUserId.mockResolvedValue({
        userId: "user-1",
        role: "MENTOR",
        id: "app-1",
      });
      mockAppUserRepo.findUserNameByUserId.mockResolvedValue("John Doe");
      mockAppUserRepo.findIdentityCardByUserId.mockResolvedValue({
        displayName: "Johnny",
        photoUrl: "/photo.jpg",
      });

      const result = await enricher.enrichByAppUserId("app-1");
      expect(result).toEqual({
        userId: "user-1",
        name: "John Doe",
        displayName: "Johnny",
        photoUrl: "/photo.jpg",
        role: "MENTOR",
        appId: "app-1",
      });
    });

    it("handles null identity card gracefully", async () => {
      mockAppUserRepo.findByAppUserId.mockResolvedValue({
        userId: "user-1",
        role: "APPRENANT",
        id: "app-1",
      });
      mockAppUserRepo.findUserNameByUserId.mockResolvedValue("Jane");
      mockAppUserRepo.findIdentityCardByUserId.mockResolvedValue(null);

      const result = await enricher.enrichByAppUserId("app-1");
      expect(result).toEqual({
        userId: "user-1",
        name: "Jane",
        displayName: null,
        photoUrl: null,
        role: "APPRENANT",
        appId: "app-1",
      });
    });

    it("handles null name", async () => {
      mockAppUserRepo.findByAppUserId.mockResolvedValue({
        userId: "user-1",
        role: "MENTOR",
        id: "app-1",
      });
      mockAppUserRepo.findUserNameByUserId.mockResolvedValue(null);
      mockAppUserRepo.findIdentityCardByUserId.mockResolvedValue({
        displayName: "Display",
        photoUrl: null,
      });

      const result = await enricher.enrichByAppUserId("app-1");
      expect(result!.name).toBeNull();
      expect(result!.displayName).toBe("Display");
    });

    it("fetches name and identity card in parallel", async () => {
      mockAppUserRepo.findByAppUserId.mockResolvedValue({
        userId: "user-1",
        role: "MENTOR",
        id: "app-1",
      });

      let nameResolved = false;
      let identityResolved = false;

      mockAppUserRepo.findUserNameByUserId.mockImplementation(
        () =>
          new Promise((resolve) => {
            nameResolved = true;
            resolve("Name");
          })
      );
      mockAppUserRepo.findIdentityCardByUserId.mockImplementation(
        () =>
          new Promise((resolve) => {
            identityResolved = true;
            resolve({ displayName: "DN", photoUrl: null });
          })
      );

      await enricher.enrichByAppUserId("app-1");
      expect(nameResolved).toBe(true);
      expect(identityResolved).toBe(true);
    });
  });
});
