"use client";

import { Controller } from "react-hook-form";
import type { Control, FieldErrors, UseFormRegister, Path } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Package,
  Tag,
  Coins,
  AlertCircle,
  Info,
} from "lucide-react";
import {
  WORKSHOP_VALIDATION,
  type CreateWorkshopFrontendData,
} from "@ls-app/shared";

interface WorkshopFormFieldsProps<T extends CreateWorkshopFrontendData = CreateWorkshopFrontendData> {
  register: UseFormRegister<T>;
  control: Control<T>;
  errors: FieldErrors<T>;
  isVirtual: boolean;
  description: string;
}

export function getDescriptionStatus(length: number) {
  if (length === 0)
    return { color: "bg-gray-300", text: "Vide", textColor: "text-gray-500" };
  if (length < 30)
    return {
      color: "bg-orange-500",
      text: "Trop court",
      textColor: "text-orange-600",
    };
  if (length <= WORKSHOP_VALIDATION.description.max * 0.9)
    return {
      color: "bg-green-500",
      text: "Parfait",
      textColor: "text-green-600",
    };
  return {
    color: "bg-yellow-500",
    text: "Proche limite",
    textColor: "text-yellow-600",
  };
}

export function convertDurationToMinutes(
  hours: number,
  minutes: number
): number | null {
  const totalMinutes = (hours || 0) * 60 + (minutes || 0);
  return totalMinutes > 0 ? totalMinutes : null;
}

export function extractDurationParts(totalMinutes: number | null): {
  hours: number;
  minutes: number;
} {
  if (!totalMinutes) return { hours: 0, minutes: 0 };
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
  };
}

export function WorkshopFormFields<T extends CreateWorkshopFrontendData>({
  register,
  control,
  errors,
  isVirtual,
  description,
}: Readonly<WorkshopFormFieldsProps<T>>) {
  const descriptionLength = description.length;
  const descriptionProgress = Math.min((descriptionLength / WORKSHOP_VALIDATION.description.max) * 100, 100);
  const descStatus = getDescriptionStatus(descriptionLength);

  // Cast errors for easier access to known fields in the UI
  const fieldErrors = errors as FieldErrors<CreateWorkshopFrontendData>;

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="title" className="text-base font-semibold">
          Titre de l'atelier <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          placeholder="Ex: Introduction à React"
          {...register("title" as Path<T>)}
          className={`rounded-full transition-colors ${fieldErrors.title ? "border-red-500 bg-red-50/50 dark:bg-red-950/20" : ""}`}
        />
        {fieldErrors.title?.message && (
          <p className="text-sm text-red-500 flex items-center gap-1.5 mt-1 ml-1">
            <AlertCircle className="h-3.5 w-3.5" />
            {String(fieldErrors.title.message)}
          </p>
        )}
        <p className="text-xs text-muted-foreground ml-1">
          Un titre clair et accrocheur (min. {WORKSHOP_VALIDATION.title.min} caractères)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-base font-semibold">
          Description
        </Label>
        <Textarea
          id="description"
          placeholder="Décrivez ce que les apprenants vont apprendre..."
          rows={4}
          maxLength={WORKSHOP_VALIDATION.description.max}
          {...register("description" as Path<T>)}
          className={`rounded-2xl transition-colors ${fieldErrors.description ? "border-red-500 bg-red-50/50 dark:bg-red-950/20" : ""}`}
        />

        <div className="space-y-1 px-1">
          <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${descStatus.color}`}
              style={{ width: `${descriptionProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{descriptionLength} / {WORKSHOP_VALIDATION.description.max} caractères</span>
            <span className={`font-medium ${descStatus.textColor}`}>
              {descStatus.text}
            </span>
          </div>
        </div>

        {fieldErrors.description?.message && (
          <p className="text-sm text-red-500 flex items-center gap-1.5 mt-1 ml-1">
            <AlertCircle className="h-3.5 w-3.5" />
            {String(fieldErrors.description.message)}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="topic"
          className="text-base font-semibold flex items-center gap-2"
        >
          <Tag className="h-4 w-4" />
          Sujet / Tags
        </Label>
        <Input
          id="topic"
          placeholder="Ex: React, Mathématiques, Design..."
          {...register("topic" as Path<T>)}
          className={`rounded-full transition-colors ${fieldErrors.topic ? "border-red-500 bg-red-50/50 dark:bg-red-950/20" : ""}`}
        />
        {fieldErrors.topic?.message && (
          <p className="text-sm text-red-500 flex items-center gap-1.5 mt-1 ml-1">
            <AlertCircle className="h-3.5 w-3.5" />
            {String(fieldErrors.topic.message)}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="date"
            className="text-base font-semibold flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Date
          </Label>
          <Input
            id="date"
            type="date"
            {...register("date" as Path<T>)}
            className={`rounded-full transition-colors ${fieldErrors.date ? "border-red-500 bg-red-50/50 dark:bg-red-950/20" : ""}`}
          />
          {fieldErrors.date?.message && (
            <p className="text-sm text-red-500 flex items-center gap-1.5 mt-1 ml-1">
              <AlertCircle className="h-3.5 w-3.5" />
              {String(fieldErrors.date.message)}
            </p>
          )}
          <p className="text-[10px] text-muted-foreground ml-1">
            <Info className="h-3 w-3 inline mr-1" />
            Optionnel pour un brouillon
          </p>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="time"
            className="text-base font-semibold flex items-center gap-2"
          >
            <Clock className="h-4 w-4" />
            Heure
          </Label>
          <Input
            id="time"
            type="time"
            {...register("time" as Path<T>)}
            className={`rounded-full transition-colors ${fieldErrors.time ? "border-red-500 bg-red-50/50 dark:bg-red-950/20" : ""}`}
          />
          {fieldErrors.time?.message && (
            <p className="text-sm text-red-500 flex items-center gap-1.5 mt-1 ml-1">
              <AlertCircle className="h-3.5 w-3.5" />
              {String(fieldErrors.time.message)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-base font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Durée
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Input
                id="durationHours"
                type="number"
                min="0"
                max="8"
                placeholder="0"
                {...register("durationHours" as Path<T>, { valueAsNumber: true })}
                className={`rounded-full transition-colors ${fieldErrors.durationHours ? "border-red-500 bg-red-50/50 dark:bg-red-950/20" : ""}`}
              />
              <p className="text-[10px] text-muted-foreground mt-1 text-center">Heures</p>
            </div>
            <div>
              <Input
                id="durationMinutes"
                type="number"
                min="0"
                max="59"
                step="15"
                placeholder="0"
                {...register("durationMinutes" as Path<T>, { valueAsNumber: true })}
                className={`rounded-full transition-colors ${fieldErrors.durationMinutes ? "border-red-500 bg-red-50/50 dark:bg-red-950/20" : ""}`}
              />
              <p className="text-[10px] text-muted-foreground mt-1 text-center">Minutes</p>
            </div>
          </div>
          {(fieldErrors.durationHours?.message ||
            fieldErrors.durationMinutes?.message) && (
              <p className="text-sm text-red-500 flex items-center gap-1.5 mt-1 ml-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {String(
                  fieldErrors.durationHours?.message || fieldErrors.durationMinutes?.message
                )}
              </p>
            )}
        </div>
      </div>

      <div className="flex items-center justify-between p-4 border border-border/50 rounded-2xl bg-muted/30">
        <div className="space-y-0.5">
          <Label htmlFor="isVirtual" className="text-base font-semibold">
            Atelier virtuel
          </Label>
          <p className="text-xs text-muted-foreground">
            L'atelier se déroulera en visioconférence
          </p>
        </div>
        <Controller
          control={control}
          name={"isVirtual" as Path<T>}
          render={({ field }) => (
            <Switch
              id="isVirtual"
              checked={!!field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </div>

      {!isVirtual && (
        <div className="space-y-2">
          <Label
            htmlFor="location"
            className="text-base font-semibold flex items-center gap-2"
          >
            <MapPin className="h-4 w-4" />
            Lieu
          </Label>
          <Input
            id="location"
            placeholder="Ex: 123 Rue de la Paix, Paris ou 'À définir'"
            {...register("location" as Path<T>)}
            className={`rounded-full transition-colors ${fieldErrors.location ? "border-red-500 bg-red-50/50 dark:bg-red-950/20" : ""}`}
          />
          {fieldErrors.location?.message && (
            <p className="text-sm text-red-500 flex items-center gap-1.5 mt-1 ml-1">
              <AlertCircle className="h-3.5 w-3.5" />
              {String(fieldErrors.location.message)}
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label
          htmlFor="maxParticipants"
          className="text-base font-semibold flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          Nombre maximum de participants
        </Label>
        <Input
          id="maxParticipants"
          type="number"
          min="1"
          max="1000"
          placeholder="Ex: 5"
          {...register("maxParticipants" as Path<T>, {
            setValueAs: (v) =>
              v === "" || v === null ? undefined : Number.parseInt(v, 10),
          })}
          className={`rounded-full transition-colors ${fieldErrors.maxParticipants ? "border-red-500 bg-red-50/50 dark:bg-red-950/20" : ""}`}
        />
        {fieldErrors.maxParticipants?.message && (
          <p className="text-sm text-red-500 flex items-center gap-1.5 mt-1 ml-1">
            <AlertCircle className="h-3.5 w-3.5" />
            {String(fieldErrors.maxParticipants.message)}
          </p>
        )}
        <p className="text-xs text-muted-foreground ml-1">
          Laisse vide si tu n'as pas de limite de participants
        </p>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="materialsNeeded"
          className="text-base font-semibold flex items-center gap-2"
        >
          <Package className="h-4 w-4" />
          Matériel nécessaire
        </Label>
        <Textarea
          id="materialsNeeded"
          placeholder="Ex: Ordinateur portable, carnet, stylo..."
          rows={3}
          {...register("materialsNeeded" as Path<T>)}
          className={`rounded-2xl transition-colors ${fieldErrors.materialsNeeded ? "border-red-500 bg-red-50/50 dark:bg-red-950/20" : ""}`}
        />
        {fieldErrors.materialsNeeded?.message && (
          <p className="text-sm text-red-500 flex items-center gap-1.5 mt-1 ml-1">
            <AlertCircle className="h-3.5 w-3.5" />
            {String(fieldErrors.materialsNeeded.message)}
          </p>
        )}
      </div>

      <div className="space-y-2 p-4 border border-brand/20 rounded-2xl bg-brand/5">
        <Label
          htmlFor="creditCost"
          className="text-base font-semibold flex items-center gap-2 text-ls-heading"
        >
          <Coins className="h-4 w-4 text-brand" />
          Tarif en crédits
        </Label>
        <Input
          id="creditCost"
          type="number"
          min={20}
          max={100}
          placeholder="20"
          {...register("creditCost" as Path<T>, { valueAsNumber: true })}
          className={`rounded-full transition-colors ${fieldErrors.creditCost ? "border-red-500 bg-red-50/50 dark:bg-red-950/20" : "border-brand/30 focus:border-brand"}`}
        />
        <div className="flex items-start gap-1.5 mt-1 ml-1">
          <Info className="h-3.5 w-3.5 text-brand mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            Recommandation : 20 crédits (minimum) pour un atelier standard. 
            Le tarif doit être compris entre 20 et 100 crédits.
          </p>
        </div>
        {fieldErrors.creditCost?.message && (
          <p className="text-sm text-red-500 flex items-center gap-1.5 mt-1 ml-1">
            <AlertCircle className="h-3.5 w-3.5" />
            {String(fieldErrors.creditCost.message)}
          </p>
        )}
      </div>
    </>
  );
}
