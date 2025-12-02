"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Rocket,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  FileText,
  Timer,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";
import { WORKSHOP_VALIDATION, isMinimumTomorrow } from "@/shared/validation";

interface PublishWorkshopDialogProps {
  workshop: {
    id: string;
    title: string;
    description: string | null;
    date: Date | null;
    time: string | null;
    duration: number | null;
    location: string | null;
    isVirtual: boolean;
    maxParticipants: number | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface ValidationError {
  field: string;
  message: string;
  icon: React.ElementType;
}

export function PublishWorkshopDialog({
  workshop,
  open,
  onOpenChange,
  onSuccess,
}: PublishWorkshopDialogProps) {
  const [isPublishing, setIsPublishing] = useState(false);

  const publishMutation = trpc.workshop.publish.useMutation({
    onSuccess: () => {
      toast.success("Atelier publié avec succès!", {
        description: "Votre atelier est maintenant visible par les apprenants.",
      });
      setIsPublishing(false);
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Erreur lors de la publication", {
        description: error.message,
      });
      setIsPublishing(false);
    },
  });

  // Validation des champs requis pour la publication
  const getValidationErrors = (): ValidationError[] => {
    if (!workshop) return [];

    const errors: ValidationError[] = [];

    if (
      !workshop.title ||
      workshop.title.trim().length < WORKSHOP_VALIDATION.title.min
    ) {
      errors.push({
        field: "Titre",
        message: `Minimum ${WORKSHOP_VALIDATION.title.min} caractères requis`,
        icon: FileText,
      });
    }

    if (!workshop.description || workshop.description.trim().length < 30) {
      errors.push({
        field: "Description",
        message: "Minimum 30 caractères recommandés",
        icon: FileText,
      });
    }

    if (!workshop.date) {
      errors.push({
        field: "Date",
        message: "La date de l'atelier est obligatoire",
        icon: Calendar,
      });
    } else if (!isMinimumTomorrow(workshop.date)) {
      errors.push({
        field: "Date",
        message: "La date doit être au minimum demain",
        icon: Calendar,
      });
    }

    if (!workshop.time) {
      errors.push({
        field: "Heure",
        message: "L'heure de début est obligatoire",
        icon: Clock,
      });
    }

    if (
      !workshop.duration ||
      workshop.duration < WORKSHOP_VALIDATION.duration.min
    ) {
      errors.push({
        field: "Durée",
        message: `Minimum ${WORKSHOP_VALIDATION.duration.min} minutes requis`,
        icon: Timer,
      });
    }

    return errors;
  };

  const validationErrors = workshop ? getValidationErrors() : [];
  const canPublish = validationErrors.length === 0;

  const handlePublish = () => {
    if (!workshop || !canPublish) return;

    setIsPublishing(true);
    publishMutation.mutate({ workshopId: workshop.id });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}min`;
    if (hours > 0) return `${hours}h`;
    return `${mins}min`;
  };

  if (!workshop) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full bg-blue-100 dark:bg-blue-900/20 p-3">
              <Rocket className="h-6 w-6 text-blue-600 dark:text-blue-500" />
            </div>
            <DialogTitle className="text-xl">Publier l'atelier</DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2">
            {canPublish ? (
              <>
                Vous êtes sur le point de publier{" "}
                <span className="font-semibold text-foreground">
                  "{workshop.title}"
                </span>
                . Il sera visible par tous les apprenants.
              </>
            ) : (
              "Certaines informations sont manquantes pour publier cet atelier."
            )}
          </DialogDescription>
        </DialogHeader>

        {!canPublish && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 my-4">
            <div className="flex items-start gap-2 mb-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
                  Informations manquantes :
                </p>
                <ul className="space-y-2">
                  {validationErrors.map((error, index) => {
                    const Icon = error.icon;
                    return (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300"
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>
                          <strong>{error.field}:</strong> {error.message}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
            <p className="text-xs text-red-700 dark:text-red-300 mt-3">
              💡 Éditez votre atelier pour compléter ces informations avant de
              publier.
            </p>
          </div>
        )}

        {canPublish && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 my-4">
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-3">
              📋 Récapitulatif :
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-300">
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  <strong>Date:</strong>{" "}
                  {workshop.date &&
                    new Date(workshop.date).toLocaleDateString("fr-FR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-300">
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  <strong>Heure:</strong> {workshop.time}
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-300">
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  <strong>Durée:</strong>{" "}
                  {workshop.duration && formatDuration(workshop.duration)}
                </span>
              </div>
              {workshop.maxParticipants && (
                <div className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-300">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>
                    <strong>Participants max:</strong>{" "}
                    {workshop.maxParticipants}
                  </span>
                </div>
              )}
              <div className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-300">
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  <strong>Format:</strong>{" "}
                  {workshop.isVirtual
                    ? "En ligne"
                    : workshop.location || "Présentiel"}
                </span>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPublishing}
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handlePublish}
            disabled={isPublishing || !canPublish}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isPublishing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {canPublish ? "Publier maintenant" : "Compléter l'atelier"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
