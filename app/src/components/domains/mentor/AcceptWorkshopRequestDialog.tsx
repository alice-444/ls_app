"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";

const acceptRequestSchema = z.object({
  date: z.string().min(1, "La date est requise"),
  time: z.string().min(1, "L'heure est requise"),
  duration: z
    .number()
    .int()
    .min(15, "La durée minimum est de 15 minutes")
    .max(480, "La durée maximum est de 8 heures")
    .optional()
    .nullable(),
  location: z.string().max(200).optional().nullable(),
  isVirtual: z.boolean(),
  maxParticipants: z
    .number()
    .int()
    .min(1, "Le nombre minimum de participants est 1")
    .optional()
    .nullable(),
});

type AcceptRequestFormData = z.infer<typeof acceptRequestSchema>;

interface AcceptWorkshopRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: string;
  requestTitle: string;
  preferredDate?: Date | null;
  preferredTime?: string | null;
  onSuccess?: () => void;
}

export function AcceptWorkshopRequestDialog({
  open,
  onOpenChange,
  requestId,
  requestTitle,
  preferredDate,
  preferredTime,
  onSuccess,
}: Readonly<AcceptWorkshopRequestDialogProps>) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<AcceptRequestFormData>({
    resolver: zodResolver(acceptRequestSchema),
    defaultValues: {
      date: preferredDate
        ? new Date(preferredDate).toISOString().split("T")[0]
        : "",
      time: preferredTime || "",
      duration: 60,
      location: "",
      isVirtual: false,
      maxParticipants: null,
    },
  });

  const acceptMutation = trpc.mentor.acceptRequest.useMutation({
    onSuccess: () => {
      toast.success("Demande acceptée avec succès !", {
        description: "L'atelier a été créé et l'apprenti a été notifié.",
      });
      reset();
      onOpenChange(false);
      setIsSubmitting(false);
      onSuccess?.();
    },
    onError: (error: { message?: string }) => {
      toast.error(
        error.message ||
        "Erreur lors de l'acceptation de la demande. Veuillez réessayer."
      );
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: AcceptRequestFormData) => {
    setIsSubmitting(true);
    acceptMutation.mutate({
      requestId,
      date: data.date,
      time: data.time,
      duration: data.duration ?? null,
      location: data.location || null,
      isVirtual: data.isVirtual ?? false,
      maxParticipants: data.maxParticipants ?? null,
    });
  };

  const isVirtual = watch("isVirtual");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            Accepter la demande d'atelier
          </DialogTitle>
          <DialogDescription>
            Confirmez les détails de planification pour l'atelier :{" "}
            <strong>{requestTitle}</strong>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">
                Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                min={new Date().toISOString().split("T")[0]}
                {...register("date")}
              />
              {errors.date && (
                <p className="text-sm text-red-500">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">
                Heure <span className="text-red-500">*</span>
              </Label>
              <Input id="time" type="time" {...register("time")} />
              {errors.time && (
                <p className="text-sm text-red-500">{errors.time.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Durée (en minutes, optionnel)</Label>
              <Input
                id="duration"
                type="number"
                min={15}
                max={480}
                step={15}
                placeholder="60"
                {...register("duration", { valueAsNumber: true })}
              />
              {errors.duration && (
                <p className="text-sm text-red-500">
                  {errors.duration.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxParticipants">
                Nombre max de participants (optionnel)
              </Label>
              <Input
                id="maxParticipants"
                type="number"
                min={1}
                placeholder="Illimité"
                {...register("maxParticipants", { valueAsNumber: true })}
              />
              {errors.maxParticipants && (
                <p className="text-sm text-red-500">
                  {errors.maxParticipants.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Laissez vide pour illimité
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="Checkbox"
                id="isVirtual"
                className="h-4 w-4 rounded border-gray-300"
                {...register("isVirtual")}
              />
              <Label htmlFor="isVirtual">Atelier virtuel</Label>
            </div>
          </div>

          {!isVirtual && (
            <div className="space-y-2">
              <Label htmlFor="location">Lieu (optionnel)</Label>
              <Input
                id="location"
                type="text"
                placeholder="Ex: Salle 101, Bâtiment A"
                maxLength={200}
                {...register("location")}
              />
              {errors.location && (
                <p className="text-sm text-red-500">
                  {errors.location.message}
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Acceptation...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Accepter et créer l'atelier
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
