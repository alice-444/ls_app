"use client";

import { User, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { UseFormRegister, UseFormWatch, FieldErrors } from "react-hook-form";
import type { MentorProfileFormData } from "../schema";

interface BasicInformationSectionProps {
  readonly register: UseFormRegister<MentorProfileFormData>;
  readonly errors: FieldErrors<MentorProfileFormData>;
  readonly bioLength: number;
  readonly previewPhoto: string | null;
  readonly existingPhotoUrl: string | null;
  readonly watch: UseFormWatch<MentorProfileFormData>;
  readonly handlePhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function BasicInformationSection({
  register,
  errors,
  bioLength,
  previewPhoto,
  watch,
  handlePhotoChange,
}: BasicInformationSectionProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <User className="h-8 w-8 text-ls-heading" />
        <h2 className="text-2xl font-semibold text-ls-heading">
          Informations de base
        </h2>
      </div>
      <p className="text-base text-ls-muted">
        Les informations essentielles de votre profil
      </p>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-ls-heading">
            Nom complet *
          </Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Ton nom"
            className="border border-ls-border bg-ls-input-bg text-ls-heading rounded-[32px]"
          />
          {errors.name && (
            <p className="text-sm text-ls-error">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio" className="text-ls-heading">
            Bio courte *
          </Label>
          <Textarea
            id="bio"
            {...register("bio")}
            placeholder="Quelques mots sur toi et ton expertise..."
            rows={3}
            maxLength={250}
            className="border border-ls-border bg-ls-input-bg text-ls-heading rounded-[16px]"
          />
          <div className="flex justify-between items-center">
            {errors.bio && (
              <p className="text-sm text-ls-error">{errors.bio.message}</p>
            )}
            <p className="text-xs text-ls-muted ml-auto">
              {bioLength}/250 caractères
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="photo" className="text-ls-heading">
            Photo de profil *
          </Label>
          <div className="flex items-center gap-4">
            <Input
              id="photo"
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <Label
              htmlFor="photo"
              className="flex items-center gap-2 px-4 py-2 border border-ls-border bg-ls-input-bg text-ls-heading rounded-[32px] cursor-pointer hover:bg-brand-soft hover:border-brand transition-colors"
            >
              <Upload className="h-4 w-4" />
              Choisir une photo
            </Label>
            {previewPhoto && (
              <div className="relative">
                <img
                  src={previewPhoto}
                  alt="Preview"
                  className="w-20 h-20 rounded-full object-cover border-2 border-ls-border"
                />
              </div>
            )}
            {watch("photo") && !previewPhoto && (
              <span className="text-sm text-ls-muted">
                {(watch("photo") as File)?.name}
              </span>
            )}
          </div>
          {errors.photo && (
            <p className="text-sm text-ls-error">
              {errors.photo.message as string}
            </p>
          )}
          <p className="text-xs text-ls-muted">
            Formats acceptés : JPG, PNG. Taille max : 5 Mo
          </p>
        </div>
      </div>
    </div>
  );
}
