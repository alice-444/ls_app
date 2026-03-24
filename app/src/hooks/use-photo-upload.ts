import { useState } from "react";
import { toast } from "sonner";
import { FileValidator } from "@ls-app/shared";
import { customAuthClient } from "@/lib/auth-server-client";
import { API_BASE_URL } from "@/lib/api-client";

interface UsePhotoUploadOptions {
  onUploadSuccess?: (photoUrl: string) => void;
}

export function usePhotoUpload({
  onUploadSuccess,
}: UsePhotoUploadOptions = {}) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = FileValidator.validatePhoto(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setIsUploading(true);
    try {
      const uploadResult = await customAuthClient.uploadPhoto(file);
      setPhotoUrl(uploadResult.photoUrl);
      setPreviewPhoto(uploadResult.photoUrl);
      toast.success("Photo uploadée avec succès");
      onUploadSuccess?.(uploadResult.photoUrl);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'upload de la photo",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = () => {
    setPhotoUrl(null);
    setPreviewPhoto(null);
  };

  const setPhotoFromUrl = (url: string | null) => {
    if (url) {
      setPhotoUrl(url);
      setPreviewPhoto(`${API_BASE_URL}${url}`);
    } else {
      setPhotoUrl(null);
      setPreviewPhoto(null);
    }
  };

  return {
    photoUrl,
    previewPhoto,
    isUploading,
    handlePhotoChange,
    removePhoto,
    setPhotoFromUrl,
  };
}
