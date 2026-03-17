import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePhotoUpload } from "@/hooks/use-photo-upload";
import { FileValidator } from "@ls-app/shared";
import { customAuthClient } from "@/lib/auth-server-client";
import { toast } from "sonner";

vi.mock("@ls-app/shared", () => ({
  FileValidator: {
    validatePhoto: vi.fn(),
  },
}));

vi.mock("@/lib/auth-server-client", () => ({
  customAuthClient: {
    uploadPhoto: vi.fn(),
  },
  authClient: {
    useSession: vi.fn(() => ({ data: null, isPending: false })),
  },
}));

vi.mock("@/lib/api-client", () => ({
  API_BASE_URL: "http://localhost:3000",
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("usePhotoUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with default values", () => {
    const { result } = renderHook(() => usePhotoUpload());
    expect(result.current.photoUrl).toBeNull();
    expect(result.current.previewPhoto).toBeNull();
    expect(result.current.isUploading).toBe(false);
  });

  it("handles photo change and successful upload", async () => {
    const mockFile = new File(["test"], "test.png", { type: "image/png" });
    const mockPhotoUrl = "/uploads/test.png";

    vi.mocked(FileValidator.validatePhoto).mockReturnValue({ valid: true });
    vi.mocked(customAuthClient.uploadPhoto).mockResolvedValue({ photoUrl: mockPhotoUrl });

    const onUploadSuccess = vi.fn();
    const { result } = renderHook(() => usePhotoUpload({ onUploadSuccess }));

    const event = {
      target: {
        files: [mockFile],
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    await act(async () => {
      await result.current.handlePhotoChange(event);
    });

    expect(FileValidator.validatePhoto).toHaveBeenCalledWith(mockFile);
    expect(customAuthClient.uploadPhoto).toHaveBeenCalledWith(mockFile);
    expect(result.current.photoUrl).toBe(mockPhotoUrl);
    expect(result.current.previewPhoto).toBe(mockPhotoUrl);
    expect(toast.success).toHaveBeenCalledWith("Photo uploadée avec succès");
    expect(onUploadSuccess).toHaveBeenCalledWith(mockPhotoUrl);
    expect(result.current.isUploading).toBe(false);
  });

  it("handles validation error", async () => {
    const mockFile = new File(["test"], "test.png", { type: "image/png" });
    vi.mocked(FileValidator.validatePhoto).mockReturnValue({
      valid: false,
      error: "File too large",
    });

    const { result } = renderHook(() => usePhotoUpload());

    const event = {
      target: {
        files: [mockFile],
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    await act(async () => {
      await result.current.handlePhotoChange(event);
    });

    expect(toast.error).toHaveBeenCalledWith("File too large");
    expect(customAuthClient.uploadPhoto).not.toHaveBeenCalled();
    expect(result.current.isUploading).toBe(false);
  });

  it("handles upload error", async () => {
    const mockFile = new File(["test"], "test.png", { type: "image/png" });
    vi.mocked(FileValidator.validatePhoto).mockReturnValue({ valid: true });
    vi.mocked(customAuthClient.uploadPhoto).mockRejectedValue(new Error("Upload failed"));

    const { result } = renderHook(() => usePhotoUpload());

    const event = {
      target: {
        files: [mockFile],
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    await act(async () => {
      await result.current.handlePhotoChange(event);
    });

    expect(toast.error).toHaveBeenCalledWith("Upload failed");
    expect(result.current.isUploading).toBe(false);
  });

  it("removes photo", () => {
    const { result } = renderHook(() => usePhotoUpload());
    
    act(() => {
      result.current.setPhotoFromUrl("/test.png");
    });
    expect(result.current.photoUrl).toBe("/test.png");

    act(() => {
      result.current.removePhoto();
    });

    expect(result.current.photoUrl).toBeNull();
    expect(result.current.previewPhoto).toBeNull();
  });

  it("sets photo from URL correctly", () => {
    const { result } = renderHook(() => usePhotoUpload());
    
    act(() => {
      result.current.setPhotoFromUrl("/my-photo.jpg");
    });

    expect(result.current.photoUrl).toBe("/my-photo.jpg");
    expect(result.current.previewPhoto).toBe("http://localhost:3000/my-photo.jpg");
  });
});
