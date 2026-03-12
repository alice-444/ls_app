import { describe, it, expect, vi, beforeEach } from "vitest";
import { mentorRouter } from "../../src/routers/mentors/mentor.router";
import { container } from "../../src/lib/di/container";

// Mock container services
vi.mock("../../src/lib/di/container", () => ({
  container: {
    workshopRequestService: { getMentorRequests: vi.fn() },
    workshopService: { getWorkshopsByCreator: vi.fn() },
    creditService: { getBalance: vi.fn() },
    userConnectionService: { getAcceptedConnections: vi.fn() },
  },
}));

describe("mentorRouter.getDashboardData", () => {
  const mockContext = {
    session: {
      user: { id: "mentor-123", role: "MENTOR" },
      expires: new Date().toISOString(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-12T12:00:00Z"));
  });

  const caller = mentorRouter.createCaller(mockContext as any);

  it("should successfully consolidate all mentor dashboard data", async () => {
    const mockRequests = [{ id: "req-1", title: "Request 1", apprentice: { name: "Alice" } }];
    const mockWorkshops = [
      { id: "ws-1", title: "Past Workshop", status: "COMPLETED", duration: 60, apprenticeId: "app-1" },
      { id: "ws-2", title: "Future Workshop", status: "PUBLISHED", date: new Date("2026-03-15"), time: "10:00", duration: 60, apprenticeId: "app-2" }
    ];
    const mockBalance = { balance: 100 };
    const mockConnections = [{ id: "conn-1" }];

    (container.workshopRequestService.getMentorRequests as any).mockResolvedValue({ ok: true, data: mockRequests });
    (container.workshopService.getWorkshopsByCreator as any).mockResolvedValue({ ok: true, data: mockWorkshops });
    (container.creditService.getBalance as any).mockResolvedValue({ ok: true, data: mockBalance });
    (container.userConnectionService.getAcceptedConnections as any).mockResolvedValue({ ok: true, data: mockConnections });

    const result = await caller.getDashboardData();

    expect(result.mentorWorkshopRequests).toHaveLength(1);
    expect(result.mentorWorkshopRequests[0].apprenticeName).toBe("Alice");
    expect(result.mentorWorkshops).toHaveLength(2);
    expect(result.pastWorkshops).toHaveLength(1);
    expect(result.pastWorkshops[0].title).toBe("Past Workshop");
    expect(result.mentorStats.totalWorkshops).toBe(2);
    expect(result.mentorStats.completedWorkshops).toBe(1);
    expect(result.mentorStats.creditsEarned).toBe(20);
    expect(result.creditBalance).toEqual(mockBalance);
    expect(result.acceptedConnections).toEqual(mockConnections);
  });

  it("should throw error if any sub-service fails", async () => {
    (container.workshopRequestService.getMentorRequests as any).mockResolvedValue({ ok: false, error: "Service Failure" });
    (container.workshopService.getWorkshopsByCreator as any).mockResolvedValue({ ok: true, data: [] });
    (container.creditService.getBalance as any).mockResolvedValue({ ok: true, data: {} });
    (container.userConnectionService.getAcceptedConnections as any).mockResolvedValue({ ok: true, data: [] });

    await expect(caller.getDashboardData()).rejects.toThrow("Une erreur est survenue. Veuillez réessayer.");
  });
});
