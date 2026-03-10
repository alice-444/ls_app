import { describe, it, expect, vi, beforeEach } from "vitest";
import { OnboardingService } from "@/lib/auth/services/onboarding";
import type { AppUserRepository } from "@/lib/users/repositories";
import * as userHelpers from "@/lib/auth/services/user-helpers";

// Mock des helpers et utils
vi.mock("../../utils/id-generator", () => ({
  generateInternalId: () => "internal-id-123",
}));

vi.mock("@/lib/auth/services/user-helpers", () => ({
  verifyUserExists: vi.fn(),
}));

describe("OnboardingService", () => {
  let service: OnboardingService;
  let mockRepo: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRepo = {
      findByUserId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    };
    service = new OnboardingService(mockRepo as unknown as AppUserRepository);
    vi.mocked(userHelpers.verifyUserExists).mockResolvedValue({ ok: true } as any);
  });

  it("should create a new user with status ACTIVE for APPRENANT", async () => {
    mockRepo.findByUserId.mockResolvedValue(null);
    mockRepo.create.mockResolvedValue({ role: "APPRENANT", status: "ACTIVE" });

    const result = await service.selectRole("user-1", { role: "APPRENANT" });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.role).toBe("APPRENANT");
    }
    expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({
      role: "APPRENANT",
      status: "ACTIVE"
    }));
  });

  it("should create a new user with status ACTIVE for MENTOR (instant activation)", async () => {
    mockRepo.findByUserId.mockResolvedValue(null);
    mockRepo.create.mockResolvedValue({ role: "MENTOR", status: "ACTIVE" });

    const result = await service.selectRole("user-1", { role: "MENTOR" });

    expect(result.ok).toBe(true);
    expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({
      role: "MENTOR",
      status: "ACTIVE"
    }));
  });

  it("should update an existing PENDING user to ACTIVE", async () => {
    mockRepo.findByUserId.mockResolvedValue({ id: "app-1", role: null, status: "PENDING" });
    mockRepo.update.mockResolvedValue({ role: "MENTOR", status: "ACTIVE" });

    const result = await service.selectRole("user-1", { role: "MENTOR" });

    expect(result.ok).toBe(true);
    expect(mockRepo.update).toHaveBeenCalledWith("app-1", expect.objectContaining({
      role: "MENTOR",
      status: "ACTIVE"
    }));
  });

  it("should allow changing role if user is ACTIVE (for back button support)", async () => {
    mockRepo.findByUserId.mockResolvedValue({ id: "app-1", role: "APPRENANT", status: "ACTIVE" });
    mockRepo.update.mockResolvedValue({ role: "MENTOR", status: "ACTIVE" });

    const result = await service.selectRole("user-1", { role: "MENTOR" });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.role).toBe("MENTOR");
    }
  });

  it("should fail if user status is not PENDING or ACTIVE", async () => {
    mockRepo.findByUserId.mockResolvedValue({ id: "app-1", role: "MENTOR", status: "BLOCKED" });

    const result = await service.selectRole("user-1", { role: "APPRENANT" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(403);
      expect(result.error).toContain("désactivé ou supprimé");
    }
  });
});
