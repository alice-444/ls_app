"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { customAuthClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface ProfilePhotoUploadProps {
  readonly previewPhoto: string | null;
  readonly onPhotoChange: (url: string | null) => void;
  readonly blockCard: string;
}

export function ProfilePhotoUpload({
  previewPhoto,
  onPhotoChange,
  blockCard,
}: ProfilePhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file: File): boolean => {
    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      toast.error("Le fichier doit être au format JPG ou PNG");
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La photo ne doit pas dépasser 5 Mo");
      return false;
    }
    return true;
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    try {
      const res = await customAuthClient.uploadPhoto(file);
      onPhotoChange(res.photoUrl);
      toast.success("Photo uploadée avec succès");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de l'upload"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handlePhotoDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (!file || !validateFile(file)) return;
      uploadFile(file);
    },
    []
  );

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !validateFile(file)) return;
    await uploadFile(file);
  };

  return (
    <div className={blockCard}>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand/15">
          <Upload className="h-4 w-4 text-brand" />
        </div>
        <h2 className="text-sm font-semibold text-ls-heading uppercase tracking-wide">
          Photo
        </h2>
      </div>
      <Input
        id="photo"
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handlePhotoChange}
        disabled={isUploading}
        className="hidden"
      />
      <div className="relative">
        <button
          type="button"
          disabled={isUploading}
          onClick={() => document.getElementById("photo")?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              document.getElementById("photo")?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
          }}
          onDrop={handlePhotoDrop}
          aria-label="Choisir ou glisser une photo"
          className={cn(
            "w-full flex flex-col sm:flex-row items-center justify-center gap-4 p-6 sm:p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer min-h-[120px] text-left",
            isDragging
              ? "border-[#FF8C42] bg-[#FF8C42]/10 scale-[0.99]"
              : "border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] hover:border-[#FF8C42]/50 hover:bg-[#FF8C42]/5",
            isUploading && "opacity-50 cursor-not-allowed"
          )}
        >
          {(() => {
            if (isUploading) {
              return (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-10 w-10 animate-spin text-brand" />
                  <span className="text-xs text-ls-muted">
                    Envoi en cours...
                  </span>
                </div>
              );
            }
            if (previewPhoto) {
              return (
                <>
                  <div className="relative shrink-0 w-20 h-20">
                    <Image
                      src={previewPhoto}
                      alt="Aperçu"
                      width={80}
                      height={80}
                      className="rounded-full object-cover ring-2 ring-brand/20"
                      unoptimized={previewPhoto.startsWith("data:")}
                    />
                  </div>
                  <span className="text-sm text-ls-muted">
                    Cliquer ou glisser pour remplacer &middot; JPG, PNG 5 Mo
                  </span>
                </>
              );
            }
            return (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 ring-2 ring-brand/20">
                  <Upload className="h-7 w-7 text-brand" />
                </div>
                <div className="text-center sm:text-left space-y-0.5">
                  <p className="text-sm font-medium text-ls-heading">
                    Dépose ta photo ici
                  </p>
                  <p className="text-xs text-ls-muted">
                    Glisser-déposer ou cliquer &middot; JPG, PNG 5 Mo max
                  </p>
                </div>
              </>
            );
          })()}
        </button>
        {previewPhoto && !isUploading && (
          <button
            type="button"
            onClick={() => onPhotoChange(null)}
            className="absolute left-[6.5rem] top-6 bg-brand text-white rounded-full p-1.5 hover:bg-brand-hover shadow-md transition-colors -translate-x-1/2 -translate-y-1/2"
            aria-label="Supprimer la photo"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
