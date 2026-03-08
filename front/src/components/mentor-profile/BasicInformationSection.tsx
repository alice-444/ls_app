"use client";

import { User, Upload, Coffee } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { UseFormRegister, UseFormWatch, FieldErrors } from "react-hook-form";
import type { MentorProfileFormData } from "./schema";
import { TagListSection } from "./TagListSection";

interface BasicInformationSectionProps {
  readonly register: UseFormRegister<MentorProfileFormData>;
  readonly errors: FieldErrors<MentorProfileFormData>;
  readonly bioLength: number;
  readonly previewPhoto: string | null;
  readonly existingPhotoUrl: string | null;
  readonly watch: UseFormWatch<MentorProfileFormData>;
  readonly handlePhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readonly iceBreakers: {
    add: (value: string) => void;
    remove: (value: string) => void;
  };
  readonly selectedIceBreakers: string[];
  readonly customIceBreaker: string;
  readonly setCustomIceBreaker: (v: string) => void;
}

export function BasicInformationSection({
  register,
  errors,
  bioLength,
  previewPhoto,
  watch,
  handlePhotoChange,
  iceBreakers,
  selectedIceBreakers,
  customIceBreaker,
  setCustomIceBreaker,
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
          <Label htmlFor="displayName" className="text-ls-heading">
            Nom d&apos;affichage (Optionnel)
          </Label>
          <Input
            id="displayName"
            {...register("displayName")}
            placeholder="Ex: Prof. Jean, Mentor Dev..."
            className="border border-ls-border bg-ls-input-bg text-ls-heading rounded-[32px]"
          />
          <p className="text-xs text-ls-muted">
            Ce nom sera affiché publiquement sur votre profil
          </p>
          {errors.displayName && (
            <p className="text-sm text-ls-error">{errors.displayName.message}</p>
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

        <div className="pt-4 border-t border-ls-border">
          <div className="flex items-center gap-2 mb-4">
            <Coffee className="h-5 w-5 text-ls-heading" />
            <h3 className="text-lg font-semibold text-ls-heading">
              Ice-breakers
            </h3>
          </div>
          <p className="text-sm text-ls-muted mb-4">
            Ajoutez jusqu&apos;à 5 petits faits ou sujets pour briser la glace (ex: &quot;Fan de café&quot;, &quot;Joueur d&apos;échecs&quot;...)
          </p>
          <TagListSection
            items={selectedIceBreakers}
            customValue={customIceBreaker}
            onCustomChange={setCustomIceBreaker}
            onAdd={iceBreakers.add}
            onRemove={iceBreakers.remove}
            placeholder="Ajouter un ice-breaker..."
            hint="Appuyez sur Entrée pour ajouter. Maximum 5."
            error={errors.iceBreakerTags?.message}
            variant="blue"
          />
        </div>
      </div>
    </div>
  );
}
