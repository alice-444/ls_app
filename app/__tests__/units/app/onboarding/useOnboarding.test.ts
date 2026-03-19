import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useOnboarding } from "@/app/onboarding/hooks/useOnboarding";
import { useRouter, useSearchParams } from "next/navigation";
import { customAuthClient } from "@/lib/auth-server-client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock("@/lib/auth-server-client", () => ({
  customAuthClient: {
    selectRole: vi.fn(),
    uploadPhoto: vi.fn(),
    saveMentorProfile: vi.fn(),
  },
  authClient: {
    useSession: vi.fn(() => ({ data: null, isPending: false })),
  },
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/lib/api-client", () => ({
  API_BASE_URL: "http://localhost:3000",
}));

describe("useOnboarding", () => {
  const mockPush = vi.fn();
  const mockInvalidateQueries = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any);
    vi.mocked(useQueryClient).mockReturnValue({ invalidateQueries: mockInvalidateQueries } as any);
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams() as any);
  });

  it("initializes at 'select' step with no role", () => {
    const { result } = renderHook(() => useOnboarding());
    expect(result.current.currentStep).toBe("select");
    expect(result.current.selectedRole).toBeNull();
  });

  it("handles role selection and step transition", () => {
    const { result } = renderHook(() => useOnboarding());
    
    act(() => {
      result.current.handleRoleSelect("MENTOR");
    });
    expect(result.current.selectedRole).toBe("MENTOR");

    act(() => {
      result.current.handleContinue();
    });
    expect(result.current.currentStep).toBe("confirm-features");
  });

  it("handles successful role confirmation for APPRENANT", async () => {
    vi.useFakeTimers();
    vi.mocked(customAuthClient.selectRole).mockResolvedValue({} as any);
    
    const { result } = renderHook(() => useOnboarding());
    
    act(() => {
      result.current.handleRoleSelect("APPRENANT");
    });

    await act(async () => {
      await result.current.handleConfirmRole();
    });

    expect(customAuthClient.selectRole).toHaveBeenCalledWith("APPRENANT");
    expect(mockInvalidateQueries).toHaveBeenCalled();
    expect(result.current.currentStep).toBe("apprenant-flow");
    
    act(() => {
      vi.runAllTimers();
    });
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
    vi.useRealTimers();
  });

  it("handles successful role confirmation for MENTOR", async () => {
    vi.mocked(customAuthClient.selectRole).mockResolvedValue({} as any);
    
    const { result } = renderHook(() => useOnboarding());
    
    act(() => {
      result.current.handleRoleSelect("MENTOR");
    });

    await act(async () => {
      await result.current.handleConfirmRole();
    });

    expect(result.current.currentStep).toBe("prof-form");
  });

  it("handles go back logic", () => {
    const { result } = renderHook(() => useOnboarding());
    
    act(() => {
      result.current.handleRoleSelect("MENTOR");
    });
    act(() => {
      result.current.handleContinue(); // step: confirm-features
    });
    expect(result.current.currentStep).toBe("confirm-features");

    act(() => {
      result.current.handleGoBack();
    });
    expect(result.current.currentStep).toBe("select");
  });

  it("handles error during role confirmation", async () => {
    vi.mocked(customAuthClient.selectRole).mockRejectedValue(new Error("Network Error"));
    
    const { result } = renderHook(() => useOnboarding());
    
    act(() => {
      result.current.handleRoleSelect("APPRENANT");
    });

    await act(async () => {
      await result.current.handleConfirmRole();
    });

    expect(toast.error).toHaveBeenCalledWith("Network Error");
    expect(result.current.isSubmitting).toBe(false);
  });
});
