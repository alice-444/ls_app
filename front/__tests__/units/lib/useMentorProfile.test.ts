import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMentorProfile } from "@/hooks/useMentorProfile";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: () => ({
      data: { user: { id: "user-1", name: "Test User" } },
      isPending: false,
    }),
  },
  customAuthClient: {
    uploadPhoto: vi.fn(),
    saveProfProfile: vi.fn(),
    publishProfile: vi.fn(),
    unpublishProfile: vi.fn(),
  },
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const mockFetch = vi.fn();
beforeEach(() => {
  global.fetch = mockFetch;
  mockFetch.mockResolvedValue({ ok: false }); // no existing profile
});

describe("useMentorProfile", () => {
  it("returns session and form", () => {
    const { result } = renderHook(() => useMentorProfile());
    expect(result.current.session).toEqual({
      user: { id: "user-1", name: "Test User" },
    });
    expect(result.current.form).toBeDefined();
    expect(result.current.form.getValues).toBeDefined();
  });

  it("returns activeSection and setActiveSection", () => {
    const { result } = renderHook(() => useMentorProfile());
    expect(result.current.activeSection).toBe("informations-base");
    act(() => {
      result.current.setActiveSection("domaines-expertise");
    });
    expect(result.current.activeSection).toBe("domaines-expertise");
  });

  it("returns topic/area/qualification/experience managers with add and remove", () => {
    const { result } = renderHook(() => useMentorProfile());
    expect(result.current.topics.add).toBeDefined();
    expect(result.current.topics.remove).toBeDefined();
    expect(result.current.areas.add).toBeDefined();
    expect(result.current.qualifications.add).toBeDefined();
    expect(result.current.experience.add).toBeDefined();
  });

  it("topics.add adds a topic and updates form", () => {
    const { result } = renderHook(() => useMentorProfile());
    act(() => {
      result.current.topics.add("React");
    });
    expect(result.current.selectedTopics).toContain("React");
    expect(result.current.form.getValues("mentorshipTopics")).toContain("React");
  });

  it("topics.remove removes a topic", () => {
    const { result } = renderHook(() => useMentorProfile());
    act(() => {
      result.current.topics.add("React");
    });
    act(() => {
      result.current.topics.remove("React");
    });
    expect(result.current.selectedTopics).not.toContain("React");
  });
});
