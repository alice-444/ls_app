import { describe, it, expect, vi, beforeEach } from "vitest";
import { apprenticeRouter } from "../../src/routers/users/apprentice.router";
import { container } from "../../src/lib/di/container";

// Mock container services
vi.mock("../../src/lib/di/container", () => ({
  container: {
    workshopRequestService: { getApprenticeRequests: vi.fn() },
    workshopService: {
      getConfirmedWorkshopsForApprentice: vi.fn(),
      getWorkshopHistoryForApprentice: vi.fn(),
    },
    creditService: { getBalance: vi.fn() },
    userConnectionService: { getAcceptedConnections: vi.fn() },
    workshopFeedbackService: { getEligibleWorkshopsForFeedback: vi.fn() },
  },
}));

describe("apprenticeRouter.getDashboardData", () => {
  const mockContext = {
    session: {
      user: { id: "app-123", role: "APPRENANT" },
      expires: new Date().toISOString(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const caller = apprenticeRouter.createCaller(mockContext as any);

  it("should successfully consolidate all apprentice dashboard data", async () => {
    const mockRequests = [{ id: "req-1" }];
    const mockWorkshops = [{ id: "ws-1" }];
    const mockHistory = [{ id: "ws-old" }];
    const mockBalance = { balance: 50 };
    const mockConnections = [{ id: "conn-1" }];
    const mockFeedback = [{ workshopId: "ws-feedback" }];

    (
      container.workshopRequestService.getApprenticeRequests as any
    ).mockResolvedValue({ ok: true, data: mockRequests });
    (
      container.workshopService.getConfirmedWorkshopsForApprentice as any
    ).mockResolvedValue({ ok: true, data: mockWorkshops });
    (
      container.workshopService.getWorkshopHistoryForApprentice as any
    ).mockResolvedValue({ ok: true, data: mockHistory });
    (container.creditService.getBalance as any).mockResolvedValue({
      ok: true,
      data: mockBalance,
    });
    (
      container.userConnectionService.getAcceptedConnections as any
    ).mockResolvedValue({ ok: true, data: mockConnections });
    (
      container.workshopFeedbackService.getEligibleWorkshopsForFeedback as any
    ).mockResolvedValue({ ok: true, data: mockFeedback });

    const result = await caller.getDashboardData();

    expect(result.workshopRequests).toEqual(mockRequests);
    expect(result.confirmedWorkshops).toEqual(mockWorkshops);
    expect(result.workshopHistory).toEqual(mockHistory);
    expect(result.creditBalance).toEqual(mockBalance);
    expect(result.acceptedConnections).toEqual(mockConnections);
    expect(result.eligibleFeedbackWorkshops).toEqual(mockFeedback);
  });

  it("should throw error if any sub-service fails", async () => {
    (
      container.workshopRequestService.getApprenticeRequests as any
    ).mockResolvedValue({ ok: false, error: "Apprentice Service Failure" });
    (
      container.workshopService.getConfirmedWorkshopsForApprentice as any
    ).mockResolvedValue({ ok: true, data: [] });
    (
      container.workshopService.getWorkshopHistoryForApprentice as any
    ).mockResolvedValue({ ok: true, data: [] });
    (container.creditService.getBalance as any).mockResolvedValue({
      ok: true,
      data: {},
    });
    (
      container.userConnectionService.getAcceptedConnections as any
    ).mockResolvedValue({ ok: true, data: [] });
    (
      container.workshopFeedbackService.getEligibleWorkshopsForFeedback as any
    ).mockResolvedValue({ ok: true, data: [] });

    await expect(caller.getDashboardData()).rejects.toThrow(
      "Une erreur est survenue. Veuillez réessayer.",
    );
  });
});
