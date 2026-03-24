"use client";

import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";
import {
  editWorkshopFrontendSchema,
  type EditWorkshopFrontendData,
  type WorkshopDetailed,
} from "@ls-app/shared";
import {
  WorkshopFormFields,
  convertDurationToMinutes,
  extractDurationParts,
} from "./WorkshopFormFields";
import { formatValidationErrors } from "./error-utils";

interface EditWorkshopFormProps {
  workshop: WorkshopDetailed;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EditWorkshopForm({
  workshop,
  onSuccess,
  onCancel,
}: Readonly<EditWorkshopFormProps>) {
  const { hours, minutes } = extractDurationParts(workshop.duration);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EditWorkshopFrontendData>({
    resolver: zodResolver(editWorkshopFrontendSchema),
    defaultValues: {
      workshopId: workshop.id,
      title: workshop.title || "",
      description: workshop.description || "",
      topic: workshop.topic || "",
      date: workshop.date
        ? new Date(workshop.date).toISOString().split("T")[0]
        : "",
      time: workshop.time || "",
      durationHours: hours,
      durationMinutes: minutes,
      location: workshop.location || "",
      isVirtual: workshop.isVirtual || false,
      maxParticipants: workshop.maxParticipants || undefined,
      materialsNeeded: workshop.materialsNeeded || "",
      creditCost: workshop.creditCost || 20,
    },
  });

  const isVirtual = watch("isVirtual");
  const description = watch("description") || "";

  const utils = trpc.useUtils();
  const updateMutation = trpc.workshop.update.useMutation({
    onSuccess: () => {
      toast.success("Atelier modifié avec succès!", {
        description: "Les modifications ont été enregistrées.",
      });
      // Invalidate queries to refresh the data
      utils.workshop.getMyWorkshops.invalidate();
      onSuccess?.();
    },
    onError: (error: { message?: string }) => {
      toast.error("Impossible de modifier l'atelier", {
        description: error.message || "Une erreur technique est survenue.",
      });
    },
  });

  const onSubmit = (data: EditWorkshopFrontendData) => {
    const duration = convertDurationToMinutes(
      data.durationHours,
      data.durationMinutes
    );

    updateMutation.mutate({
      workshopId: data.workshopId,
      title: data.title,
      description: data.description || "",
      topic: data.topic || null,
      date: data.date || undefined,
      time: data.time || undefined,
      duration: duration || undefined,
      location: data.isVirtual ? null : (data.location || null),
      isVirtual: data.isVirtual,
      maxParticipants: data.maxParticipants || null,
      materialsNeeded: data.materialsNeeded || null,
      creditCost: data.creditCost ?? null,
    });
  };

  const onInvalid = (errors: FieldErrors<EditWorkshopFrontendData>) => {
    console.error("Form validation errors (detailed):", errors);
    toast.error("Formulaire invalide", {
      description: formatValidationErrors(errors),
    });
  };

  return (
    <Card className="border-border/50 bg-card/95 dark:bg-card/95 backdrop-blur-md shadow-xl overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-ls-heading">
          Modifier l&apos;atelier
        </CardTitle>
        <CardDescription className="text-ls-muted">
          Mets à jour les informations de ton atelier
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
          <input type="hidden" {...register("workshopId")} />
          <WorkshopFormFields
            register={register}
            control={control}
            errors={errors}
            isVirtual={isVirtual}
            description={description}
          />

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              className="flex-1 rounded-full font-semibold"
              disabled={isSubmitting || updateMutation.isPending}
            >
              {(isSubmitting || updateMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Enregistrer les modifications
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting || updateMutation.isPending}
                className="rounded-full"
              >
                Annuler
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
