import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePasswordForm } from "@/hooks/use-password-form";

vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}));

describe("usePasswordForm", () => {
  it("returns initial state", () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      usePasswordForm({ onSubmit, requireCurrentPassword: false })
    );
    expect(result.current.newPassword).toBe("");
    expect(result.current.confirmPassword).toBe("");
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.showNewPassword).toBe(false);
  });

  it("updates newPassword and confirmPassword via setters", () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      usePasswordForm({ onSubmit, requireCurrentPassword: false })
    );
    act(() => {
      result.current.setNewPassword("newPass123");
      result.current.setConfirmPassword("newPass123");
    });
    expect(result.current.newPassword).toBe("newPass123");
    expect(result.current.confirmPassword).toBe("newPass123");
  });

  it("reset clears all password fields", () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      usePasswordForm({ onSubmit, requireCurrentPassword: false })
    );
    act(() => {
      result.current.setNewPassword("a");
      result.current.setConfirmPassword("a");
    });
    act(() => result.current.reset());
    expect(result.current.newPassword).toBe("");
    expect(result.current.confirmPassword).toBe("");
  });

  it("handleSubmit calls onSubmit when passwords match and are valid", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      usePasswordForm({ onSubmit, requireCurrentPassword: false })
    );
    act(() => {
      result.current.setNewPassword("ValidPass1!");
      result.current.setConfirmPassword("ValidPass1!");
    });
    await act(async () => {
      result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });
    expect(onSubmit).toHaveBeenCalledWith({
      newPassword: "ValidPass1!",
      confirmPassword: "ValidPass1!",
    });
  });
});
