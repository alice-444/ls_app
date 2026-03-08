"use client";

import { Controller } from "react-hook-form";
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
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
} from "lucide-react";
import { WORKSHOP_VALIDATION } from "@/shared/validation";
import type {
  CreateWorkshopFrontendData,
  EditWorkshopFrontendData,
} from "@/shared/validation";


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
  if (length <= 90)
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
  const totalMinutes = hours * 60 + minutes;
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

export function WorkshopFormFields({
  register,
  control,
  errors,
  isVirtual,
  description,
}: WorkshopFormFieldsProps) {
  const descriptionLength = description.length;
  const descriptionProgress = Math.min((descriptionLength / 100) * 100, 100);
  const descStatus = getDescriptionStatus(descriptionLength);

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="title" className="text-base font-semibold">
          Titre de l'atelier <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          placeholder="Ex: Introduction à React"
          {...register("title")}
          className={`rounded-full ${errors.title ? "border-red-500" : ""}`}
        />
        {errors.title?.message && (
          <p className="text-sm text-red-500">{String(errors.title.message)}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-base font-semibold">
          Description
        </Label>
        <Textarea
          id="description"
          placeholder="Description courte de l'atelier..."
          rows={3}
          maxLength={100}
          {...register("description")}
          className={`rounded-2xl ${errors.description ? "border-red-500" : ""}`}
        />

        <div className="space-y-1">
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${descStatus.color}`}
              style={{ width: `${descriptionProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{descriptionLength} / 100 caractères</span>
            <span className={`font-medium ${descStatus.textColor}`}>
              {descStatus.text}
            </span>
          </div>
        </div>

        {errors.description?.message && (
          <p className="text-sm text-red-500">
            {String(errors.description.message)}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="topic"
          className="text-base font-semibold flex items-center gap-2"
        >
          <Tag className="h-4 w-4" />
          Tag(s) / Sujet(s)
        </Label>
        <Input
          id="topic"
          placeholder="Ex: React, Mathématiques, Design, Programmation..."
          {...register("topic")}
          className={`rounded-full ${errors.topic ? "border-red-500" : ""}`}
        />
        {errors.topic?.message && (
          <p className="text-sm text-red-500">{String(errors.topic.message)}</p>
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
            {...register("date")}
            className={`rounded-full ${errors.date ? "border-red-500" : ""}`}
          />
          {errors.date?.message && (
            <p className="text-sm text-red-500">
              {String(errors.date.message)}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Requis uniquement lors de la publication
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
            {...register("time")}
            className={`rounded-full ${errors.time ? "border-red-500" : ""}`}
          />
          {errors.time?.message && (
            <p className="text-sm text-red-500">
              {String(errors.time.message)}
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
                {...register("durationHours", { valueAsNumber: true })}
                className={`rounded-full ${errors.durationHours ? "border-red-500" : ""}`}
              />
              <p className="text-xs text-muted-foreground mt-1">Heures</p>
            </div>
            <div>
              <Input
                id="durationMinutes"
                type="number"
                min="0"
                max="59"
                step="15"
                placeholder="0"
                {...register("durationMinutes", { valueAsNumber: true })}
                className={`rounded-full ${errors.durationMinutes ? "border-red-500" : ""}`}
              />
              <p className="text-xs text-muted-foreground mt-1">Minutes</p>
            </div>
          </div>
          {(errors.durationHours?.message ||
            errors.durationMinutes?.message) && (
            <p className="text-sm text-red-500">
              {String(
                errors.durationHours?.message || errors.durationMinutes?.message
              )}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between p-4 border rounded-2xl">
        <div className="space-y-0.5">
          <Label htmlFor="isVirtual" className="text-base font-semibold">
            Atelier virtuel
          </Label>
          <p className="text-sm text-muted-foreground">
            L'atelier se déroulera en ligne
          </p>
        </div>
        <Controller
          control={control}
          name="isVirtual"
          render={({ field }) => (
            <Switch
              id="isVirtual"
              checked={field.value}
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
            placeholder="Ex: 123 Rue de la Paix, Paris"
            {...register("location")}
            className={`rounded-full ${errors.location ? "border-red-500" : ""}`}
          />
          {errors.location?.message && (
            <p className="text-sm text-red-500">
              {String(errors.location.message)}
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
          placeholder="Ex: 5 (laisse vide si aucune limite)"
          {...register("maxParticipants", {
            setValueAs: (v) =>
              v === "" || v === null ? undefined : parseInt(v, 10),
          })}
          className={`rounded-full ${errors.maxParticipants ? "border-red-500" : ""}`}
        />
        {errors.maxParticipants?.message && (
          <p className="text-sm text-red-500">
            {String(errors.maxParticipants.message)}
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          Laisse vide si aucune limite
        </p>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="materialsNeeded"
          className="text-base font-semibold flex items-center gap-2"
        >
          <Package className="h-4 w-4" />
          Matériaux nécessaires
        </Label>
        <Textarea
          id="materialsNeeded"
          placeholder="Ex: Ordinateur portable, logiciel(s) nécessaire(s),..."
          rows={3}
          {...register("materialsNeeded")}
          className={`rounded-2xl ${errors.materialsNeeded ? "border-red-500" : ""}`}
        />
        {errors.materialsNeeded?.message && (
          <p className="text-sm text-red-500">
            {String(errors.materialsNeeded.message)}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="creditCost"
          className="text-base font-semibold flex items-center gap-2"
        >
          <Coins className="h-4 w-4" />
          Nombre de crédits
        </Label>
        <Input
          id="creditCost"
          type="number"
          min={20}
          max={100}
          placeholder="20"
          {...register("creditCost", { valueAsNumber: true })}
          className={`rounded-full ${errors.creditCost ? "border-red-500" : ""}`}
        />
        <p className="text-xs text-muted-foreground">
          Le nombre minimum de crédits est 20 et le maximum est 100 (par défaut: 20)
        </p>
        {errors.creditCost?.message && (
          <p className="text-sm text-red-500">
            {String(errors.creditCost.message)}
          </p>
        )}
      </div>
    </>
  );
}
